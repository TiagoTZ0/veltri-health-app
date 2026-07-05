from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import DietTemplate

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_diet_recommendations(request):
    try:
        perfil = request.user.perfilusuario
    except:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    budget = perfil.presupuesto_semanal_limite

    # SELECT * FROM diet_templates WHERE cost <= user_budget
    diets = DietTemplate.objects.filter(costo_estimado__lte=budget)

    data = []
    for d in diets:
        data.append({
            'id': d.id,
            'nombre': d.nombre,
            'costo_estimado': d.costo_estimado,
            'calorias_totales': d.calorias_totales
        })

    return Response({'recommendations': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_foods(request):
    query = request.GET.get('q', '')
    if not query:
        return Response([])

    from .models import CatalogoAlimento, PrecioActual
    
    # Búsqueda simple case-insensitive
    alimentos = CatalogoAlimento.objects.filter(nombre_alimento__icontains=query)[:20]
    
    data = []
    for a in alimentos:
        # Traer precio si lo hay
        precio_obj = PrecioActual.objects.filter(alimento=a).order_by('-ultima_actualizacion').first()
        base_price = float(precio_obj.precio_actual) if precio_obj else 12.50
        
        data.append({
            'id': a.id,
            'nombre_alimento': a.nombre_alimento,
            'calorias_100g': a.calorias_100g,
            'proteinas_100g': a.proteinas_100g or 0,
            'carbohidratos_100g': a.carbohidratos_100g or 0,
            'grasas_100g': a.grasas_100g or 0,
            'categoria': a.categoria,
            'base_price_kg': base_price
        })
        
    return Response(data)
