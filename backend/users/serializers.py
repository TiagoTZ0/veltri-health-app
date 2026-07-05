from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PerfilUsuario

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['edad', 'peso_actual', 'altura', 'objetivo_salud', 'presupuesto_semanal_limite', 'meta_calorica_diaria']

class UserSerializer(serializers.ModelSerializer):
    perfilusuario = PerfilUsuarioSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'perfilusuario']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        perfil_data = validated_data.pop('perfilusuario')
        user = User.objects.create_user(**validated_data)
        PerfilUsuario.objects.create(user=user, **perfil_data)
        return user
