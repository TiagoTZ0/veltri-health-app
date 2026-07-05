from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
import os
import requests
from diets.models import CatalogoAlimento

AI_MICROSERVICE_URL = os.environ.get("ML_API_URL", "http://localhost:8001/predict/")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_image(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    file_name = default_storage.save(image_file.name, image_file)
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (file_name, f, image_file.content_type)}
            ai_response = requests.post(AI_MICROSERVICE_URL, files=files)
            ai_response.raise_for_status()
            ai_data = ai_response.json()
    except Exception as e:
        # Limpiar imagen aunque falle
        default_storage.delete(file_name)
        return Response({'error': f'Error communicating with AI: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if 'error' in ai_data:
        return Response({'error': ai_data['error']}, status=status.HTTP_400_BAD_REQUEST)

    prediction = ai_data.get('prediction', 'Unknown')
    kcal_per_100g = ai_data.get('kcal_per_100g', 0.0)
    confidence = ai_data.get('confidence', 0.0)

    # Get or create in catalog
    alimento, created = CatalogoAlimento.objects.get_or_create(
        nombre_alimento=prediction,
        defaults={'calorias_100g': kcal_per_100g}
    )

    # Actual Smart-Budget logic for price
    from diets.models import PrecioActual
    precio_obj = PrecioActual.objects.filter(alimento=alimento).order_by('-ultima_actualizacion').first()
    
    if precio_obj:
        base_price = float(precio_obj.precio_actual)
    else:
        # Fallback si no hay precio scrapeado
        base_price = 12.50

    # Limpiar imagen temporal del disco
    default_storage.delete(file_name)
    
    return Response({
        'food_id': alimento.id,
        'prediction': prediction,
        'confidence': confidence,
        'nutrition_per_100g': {
            'kcal': alimento.calorias_100g,
            'proteins': alimento.proteinas_100g,
            'carbs': alimento.carbohidratos_100g,
            'fats': alimento.grasas_100g
        },
        'economics': {
            'base_price': base_price
        },
        'image_url': f"{settings.MEDIA_URL}{file_name}"  # URL será inválida, es solo referencia
    })
