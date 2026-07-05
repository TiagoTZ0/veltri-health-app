from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import LogEscaneoIA, LogAgua
from diets.models import CatalogoAlimento

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_stats(request):
    try:
        perfil = request.user.perfilusuario
    except:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()
    logs = LogEscaneoIA.objects.filter(perfil=perfil, fecha_escaneo__date=today)
    water_logs = LogAgua.objects.filter(perfil=perfil, fecha_registro__date=today)

    calorias_consumidas = sum(log.calorias_registradas for log in logs if log.calorias_registradas)
    proteinas_consumidas = sum(log.proteinas_registradas for log in logs if log.proteinas_registradas)
    carbohidratos_consumidas = sum(log.carbohidratos_registrados for log in logs if log.carbohidratos_registrados)
    grasas_consumidas = sum(log.grasas_registradas for log in logs if log.grasas_registradas)
    gasto_actual = sum(log.costo_estimado_al_momento for log in logs if log.costo_estimado_al_momento)
    vasos_agua = water_logs.count()

    return Response({
        "presupuesto_semanal": perfil.presupuesto_semanal_limite,
        "gasto_actual": gasto_actual,
        "calorias_consumidas_hoy": calorias_consumidas,
        "calorias_meta": perfil.meta_calorica_diaria,
        "vasos_agua": vasos_agua,
        "macros_consumidos_hoy": {
            "proteinas": proteinas_consumidas,
            "carbohidratos": carbohidratos_consumidas,
            "grasas": grasas_consumidas
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_water(request):
    try:
        perfil = request.user.perfilusuario
    except:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    cantidad_ml = int(request.data.get('cantidad_ml', 250))
    log = LogAgua.objects.create(perfil=perfil, cantidad_ml=cantidad_ml)
    
    return Response({'message': 'Water logged successfully', 'vasos': LogAgua.objects.filter(perfil=perfil, fecha_registro__date=timezone.now().date()).count()})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_food(request):
    try:
        perfil = request.user.perfilusuario
    except:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    food_id = request.data.get('food_id')
    cantidad_gramos = float(request.data.get('cantidad_gramos', 0))
    tipo_comida = request.data.get('tipo_comida', 'Almuerzo')
    costo_estimado = float(request.data.get('costo_estimado', 0))

    try:
        alimento = CatalogoAlimento.objects.get(id=food_id)
    except CatalogoAlimento.DoesNotExist:
        return Response({'error': 'Food not found in catalog'}, status=status.HTTP_404_NOT_FOUND)

    factor = cantidad_gramos / 100.0
    calorias = (alimento.calorias_100g or 0) * factor
    proteinas = (alimento.proteinas_100g or 0) * factor
    carbohidratos = (alimento.carbohidratos_100g or 0) * factor
    grasas = (alimento.grasas_100g or 0) * factor

    log = LogEscaneoIA.objects.create(
        perfil=perfil,
        alimento_detectado=alimento,
        tipo_comida=tipo_comida,
        cantidad_gramos=cantidad_gramos,
        costo_estimado_al_momento=costo_estimado,
        calorias_registradas=calorias,
        proteinas_registradas=proteinas,
        carbohidratos_registrados=carbohidratos,
        grasas_registradas=grasas
    )

    return Response({'message': 'Food logged successfully', 'log_id': log.id}, status=status.HTTP_201_CREATED)
