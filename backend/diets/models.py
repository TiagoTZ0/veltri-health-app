from django.db import models
from users.models import PerfilUsuario

class CatalogoAlimento(models.Model):
    CATEGORIAS = [
        ('proteina', 'Proteína'),
        ('vegetal', 'Vegetal'),
        ('carbohidrato', 'Carbohidrato'),
        ('fruta', 'Fruta'),
        ('grasa', 'Grasa'),
        ('otro', 'Otro')
    ]
    nombre_alimento = models.CharField(max_length=200)
    calorias_100g = models.FloatField()
    proteinas_100g = models.FloatField(null=True, blank=True)
    carbohidratos_100g = models.FloatField(null=True, blank=True)
    grasas_100g = models.FloatField(null=True, blank=True)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='otro')

class PrecioActual(models.Model):
    alimento = models.ForeignKey(CatalogoAlimento, on_delete=models.CASCADE)
    tienda_origen = models.CharField(max_length=100)
    precio_actual = models.DecimalField(max_digits=10, decimal_places=2)
    unidad_medida = models.CharField(max_length=50, default='kg')
    ultima_actualizacion = models.DateTimeField(auto_now=True)

class PlanDieta(models.Model):
    perfil = models.ForeignKey(PerfilUsuario, on_delete=models.CASCADE)
    costo_total_calculado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calorias_totales_plan = models.IntegerField(null=True, blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)

class DietTemplate(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    costo_estimado = models.DecimalField(max_digits=10, decimal_places=2)
    calorias_totales = models.IntegerField()
    proteinas_totales = models.FloatField(null=True, blank=True)
    carbohidratos_totales = models.FloatField(null=True, blank=True)
    grasas_totales = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.nombre

class DietIngredient(models.Model):
    template = models.ForeignKey(DietTemplate, related_name='ingredients', on_delete=models.CASCADE)
    alimento = models.ForeignKey(CatalogoAlimento, on_delete=models.CASCADE)
    cantidad_gramos = models.DecimalField(max_digits=6, decimal_places=2)
    dia_de_semana = models.IntegerField(help_text="1=Lunes, 7=Domingo", default=1)
    tipo_comida = models.CharField(max_length=20, choices=[
        ('Desayuno', 'Desayuno'),
        ('Almuerzo', 'Almuerzo'),
        ('Cena', 'Cena'),
        ('Snack', 'Snack')
    ])
