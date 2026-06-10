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
    costo_estimado_al_momento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calorias_registradas = models.FloatField(null=True, blank=True)
    fecha_escaneo = models.DateTimeField(auto_now_add=True)
