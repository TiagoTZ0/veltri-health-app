from django.db import models
from django.contrib.auth.models import User

class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    factor_correccion_precio = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)

    def __str__(self):
        return self.nombre

class Provincia(models.Model):
    departamento = models.ForeignKey(Departamento, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)

class Distrito(models.Model):
    provincia = models.ForeignKey(Provincia, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    ubigeo_code = models.CharField(max_length=6, blank=True, null=True)

class PerfilUsuario(models.Model):
    OBJETIVOS = [
        ('bajar_peso', 'Bajar de peso'),
        ('ganar_masa', 'Ganar masa muscular'),
        ('mantener', 'Mantener peso')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    edad = models.IntegerField(null=True, blank=True)
    peso_actual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    altura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    objetivo_salud = models.CharField(max_length=20, choices=OBJETIVOS, default='mantener')
    presupuesto_semanal_limite = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    distrito = models.ForeignKey(Distrito, on_delete=models.SET_NULL, null=True, blank=True)
    meta_calorica_diaria = models.IntegerField(null=True, blank=True)
