from django.db import models
from users.models import PerfilUsuario
from diets.models import CatalogoAlimento

class LogEscaneoIA(models.Model):
    TIPO_COMIDA = [
        ('Desayuno', 'Desayuno'),
        ('Almuerzo', 'Almuerzo'),
        ('Cena', 'Cena'),
        ('Snack', 'Snack'),
        ('Fuera_de_plan', 'Fuera de plan')
    ]
    perfil = models.ForeignKey(PerfilUsuario, on_delete=models.CASCADE)
    alimento_detectado = models.ForeignKey(CatalogoAlimento, on_delete=models.SET_NULL, null=True)
    imagen_path = models.CharField(max_length=255, null=True, blank=True)
    tipo_comida = models.CharField(max_length=20, choices=TIPO_COMIDA)
    cantidad_gramos = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    costo_estimado_al_momento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calorias_registradas = models.FloatField(null=True, blank=True)
    proteinas_registradas = models.FloatField(null=True, blank=True)
    carbohidratos_registrados = models.FloatField(null=True, blank=True)
    grasas_registradas = models.FloatField(null=True, blank=True)
    fecha_escaneo = models.DateTimeField(auto_now_add=True)

class LogAgua(models.Model):
    perfil = models.ForeignKey(PerfilUsuario, on_delete=models.CASCADE)
    cantidad_ml = models.IntegerField(default=250)
    fecha_registro = models.DateTimeField(auto_now_add=True)
