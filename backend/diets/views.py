import os
import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
from .models import CatalogoAlimento, LogEscaneoIA, PerfilUsuario

AI_MICROSERVICE_URL = "http://localhost:8001/predict/"


@api_view(['POST'])
def scan_food(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    
    # Save image temporarily
    file_name = default_storage.save(image_file.name, image_file)
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)

    # Call AI Microservice
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (file_name, f, image_file.content_type)}
            ai_response = requests.post(AI_MICROSERVICE_URL, files=files)
            ai_response.raise_for_status()
            ai_data = ai_response.json()
    except Exception as e:
        return Response({'error': f'Error communicating with AI microservice: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if 'error' in ai_data:
        return Response({'error': ai_data['error']}, status=status.HTTP_400_BAD_REQUEST)

    prediction = ai_data.get('prediction', 'Unknown')
    kcal_per_100g = ai_data.get('kcal_per_100g', 0.0)
    confidence = ai_data.get('confidence', 0.0)

    # Mock finding or creating the food in the catalog
    alimento, created = CatalogoAlimento.objects.get_or_create(
        nombre_alimento=prediction,
        defaults={'calorias_100g': kcal_per_100g}
    )

    from django.contrib.auth.models import User
    dummy_user, _ = User.objects.get_or_create(username='mvp_user', defaults={'email': 'mvp@veltri.com'})
    # Mock fetching user profile
    perfil, _ = PerfilUsuario.objects.get_or_create(
        user=dummy_user, 
        defaults={
            'presupuesto_semanal_limite': 150.00
        }
    )

    # Simulated Smart-Budget / Regional Pricing Logic
    # 25% discount logic for La Libertad / Trujillo
    base_price_lima = 12.50 # Simulated Midagri price
    trujillo_discount = 0.25
    local_price = base_price_lima * (1 - trujillo_discount)

    # Save Scan Log
    log = LogEscaneoIA.objects.create(
        perfil=perfil,
        alimento_detectado=alimento,
        imagen_path=file_path,
        tipo_comida=request.data.get('tipo_comida', 'Almuerzo'),
        costo_estimado_al_momento=local_price,
        calorias_registradas=kcal_per_100g * 1.5 # Assuming 150g portion
    )

    return Response({
        'scan_id': log.id,
        'prediction': prediction,
        'confidence': confidence,
        'nutrition': {
            'kcal_per_100g': kcal_per_100g,
            'total_kcal': log.calorias_registradas,
        },
        'economics': {
            'base_price_lima': base_price_lima,
            'local_price_estimated': local_price,
            'savings_vs_lima': base_price_lima - local_price
        },
        'image_url': f"{settings.MEDIA_URL}{file_name}"
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_user_stats(request):
    # Mocking user stats
    return Response({
        "presupuesto_semanal": 150.00,
        "gasto_actual": 45.20,
        "calorias_consumidas_hoy": 1250,
        "calorias_meta": 2000,
        "proyeccion_ahorro_mensual": 85.00
    })
