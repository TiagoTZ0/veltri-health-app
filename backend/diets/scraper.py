import requests
import json
from decimal import Decimal
from diets.models import CatalogoAlimento, PrecioActual

PLAZA_VEA_API = "https://www.plazavea.com.pe/api/catalog_system/pub/products/search/{}"

def parse_price_from_vtex(data):
    """
    Extrae el precio más bajo del JSON de VTEX.
    Asumimos que data es la lista de productos retornada.
    """
    if not data or not isinstance(data, list):
        return None
        
    lowest_price = None
    
    for product in data:
        items = product.get('items', [])
        for item in items:
            sellers = item.get('sellers', [])
            for seller in sellers:
                commertial_offer = seller.get('commertialOffer', {})
                price = commertial_offer.get('Price')
                
                # Descartar precios nulos o cero
                if price is not None and price > 0:
                    if lowest_price is None or price < lowest_price:
                        lowest_price = price
                        
    return lowest_price

def scrape_all_prices():
    """
    Itera sobre el Catálogo de Alimentos y actualiza precios desde Plaza Vea.
    """
    alimentos = CatalogoAlimento.objects.all()
    updated_count = 0
    failed_count = 0
    
    for alimento in alimentos:
        try:
            # Reemplazar espacios por '%20'
            query = alimento.nombre_alimento.replace(' ', '%20')
            url = PLAZA_VEA_API.format(query)
            
            response = requests.get(url, timeout=10)
            
            if response.status_code in [200, 206]:
                data = response.json()
                price = parse_price_from_vtex(data)
                
                if price is not None:
                    # Guardar o actualizar en PrecioActual
                    PrecioActual.objects.update_or_create(
                        alimento=alimento,
                        tienda_origen='Plaza Vea',
                        defaults={
                            'precio_actual': Decimal(str(price)),
                            'unidad_medida': 'kg'  # Asumimos que los productos frescos están por KG
                        }
                    )
                    updated_count += 1
                    print(f"[OK] {alimento.nombre_alimento} -> S/ {price}")
                else:
                    failed_count += 1
                    print(f"[WARN] No se encontró precio para {alimento.nombre_alimento}")
            else:
                failed_count += 1
                print(f"[ERROR] API devolvió {response.status_code} para {alimento.nombre_alimento}")
                
        except Exception as e:
            failed_count += 1
            print(f"[ERROR] Excepción al procesar {alimento.nombre_alimento}: {str(e)}")
            
    recalculate_diet_costs()
            
    return updated_count, failed_count

def recalculate_diet_costs():
    from diets.models import DietTemplate
    templates = DietTemplate.objects.all()
    for template in templates:
        total_cost = Decimal('0.00')
        for ingredient in template.ingredients.all():
            precio_obj = PrecioActual.objects.filter(alimento=ingredient.alimento).order_by('-ultima_actualizacion').first()
            if precio_obj:
                # Precio es por kg (1000g). Cantidad es en gramos.
                costo_ingrediente = (precio_obj.precio_actual / Decimal('1000.0')) * ingredient.cantidad_gramos
                total_cost += costo_ingrediente
            else:
                # Fallback genérico si no hay precio
                total_cost += (Decimal('12.50') / Decimal('1000.0')) * ingredient.cantidad_gramos
        
        template.costo_estimado = total_cost
        template.save()
        print(f"[INFO] Dieta '{template.nombre}' recalculada a S/ {total_cost:.2f}")
