from rest_framework import serializers
from .models import LogEscaneoIA, CatalogoAlimento

class CatalogoAlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogoAlimento
        fields = '__all__'

class LogEscaneoIASerializer(serializers.ModelSerializer):
    alimento_detectado = CatalogoAlimentoSerializer(read_only=True)
    
    class Meta:
        model = LogEscaneoIA
        fields = '__all__'
