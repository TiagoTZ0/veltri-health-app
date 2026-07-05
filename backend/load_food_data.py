import os
import django
import csv
from decimal import Decimal

# Configurar entorno de Django (útil si se ejecuta como script standalone)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from diets.models import CatalogoAlimento

def load_data(csv_path):
    print(f"Cargando datos desde {csv_path}...")
    try:
        with open(csv_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            count = 0
            for row in reader:
                nombre = row.get('nombre_alimento')
                calorias = row.get('calorias_100g', 0)
                proteinas = row.get('proteinas_100g', 0)
                carbohidratos = row.get('carbohidratos_100g', 0)
                grasas = row.get('grasas_100g', 0)
                
                if nombre:
                    CatalogoAlimento.objects.update_or_create(
                        nombre_alimento=nombre,
                        defaults={
                            'calorias_100g': float(calorias) if calorias else 0,
                            'proteinas_100g': float(proteinas) if proteinas else 0,
                            'carbohidratos_100g': float(carbohidratos) if carbohidratos else 0,
                            'grasas_100g': float(grasas) if grasas else 0,
                            'categoria': row.get('categoria', 'Otros')
                        }
                    )
                    count += 1
                    
            print(f"¡Éxito! {count} alimentos importados a la Base de Datos Gigante.")
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {csv_path}")
        print("Asegúrate de colocar tu Excel/CSV del Instituto Nacional de Salud en esa ruta.")

if __name__ == '__main__':
    # Ruta por defecto donde el usuario colocará su archivo CSV
    DEFAULT_CSV_PATH = 'data/alimentos_peruanos.csv'
    
    # Crear carpeta dummy si no existe
    os.makedirs('data', exist_ok=True)
    
    # Crear un CSV de muestra si no existe para que el usuario entienda el formato
    if not os.path.exists(DEFAULT_CSV_PATH):
        print(f"Creando un archivo de muestra en {DEFAULT_CSV_PATH}...")
        with open(DEFAULT_CSV_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['nombre_alimento', 'calorias_100g', 'proteinas_100g', 'carbohidratos_100g', 'grasas_100g', 'categoria'])
            writer.writerow(['Quinoa Cocida', '120', '4.4', '21.3', '1.9', 'Cereales'])
            writer.writerow(['Lomo Saltado', '180', '12.0', '15.0', '8.0', 'Platos Preparados'])
            writer.writerow(['Ceviche de Pescado', '95', '18.0', '4.0', '1.5', 'Platos Preparados'])
            
    load_data(DEFAULT_CSV_PATH)
