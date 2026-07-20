<#
Script para crear recursos en Render usando la API.

USO (PowerShell):
1) Establece tu API key (la que compartiste) en la variable RENDER_API_KEY o pásala como argumento.
   $env:RENDER_API_KEY = 'rnd_8EWGrrLcGZbJ5oCzDXrUr88z37Wv'
2) Rellena las variables $GithubRepo (owner/repo) y $Branch.
3) Ejecuta: .\render_setup.ps1

IMPORTANTE: Este script contiene ejemplos de llamadas `curl` a la API de Render.
Antes de ejecutarlo, revisa y adapta los payloads con la información de tu repo.
Este script NO será ejecutado por el agente aquí — debes ejecutarlo en tu máquina.
#>

param(
    [string]$ApiKey = $env:RENDER_API_KEY,
    [string]$GithubRepo = '', # ejemplo: vanto/veltri-health-app
    [string]$Branch = 'main',
    [string]$Region = 'oregon'
)

if (-not $ApiKey) {
    Write-Error "RENDER API key not provided. Set RENDER_API_KEY or pass -ApiKey"
    exit 1
}

$Headers = @{
    Authorization = "Bearer $ApiKey"
    "Content-Type" = "application/json"
}

Write-Host "Este script intentará crear una base de datos gestionada y dará comandos para crear servicios."
Write-Host "Por seguridad, revisa los payloads antes de ejecutar cualquier petición."

if (-not $GithubRepo) {
    Write-Host "No se crearán servicios automáticos porque falta el repo GitHub."
    Write-Host "Sigue estas instrucciones manuales en el dashboard de Render o vuelve a ejecutar con -GithubRepo 'owner/repo'"
    exit 0
}

# --- Crear Managed Postgres ---
$dbPayload = @{
    name = "veltri-db"
    engine = "postgres"
    plan = "starter"
    region = $Region
} | ConvertTo-Json

Write-Host "Crear base de datos managed (POST /v1/databases)"
Write-Host "Payload: $dbPayload"

Write-Host "-- EJEMPLO de curl (descomenta y adapta para ejecutar) --"
Write-Host "curl -X POST https://api.render.com/v1/databases -H \"Authorization: Bearer <API_KEY>\" -H \"Content-Type: application/json\" -d '$dbPayload'"

Write-Host "\nDespués de crear la DB, copia la DATABASE_URL desde el dashboard de Render y añádela como secret en el servicio backend."

# --- Crear servicios (ejemplo manual / guía) ---
Write-Host "\nPara crear cada servicio (backend / ai-service / frontend) normalmente en Render debes:"
Write-Host "  - Conectar el repo GitHub al proyecto (Dashboard → New → Web Service)"
Write-Host "  - Seleccionar branch: $Branch"
Write-Host "  - Para backend y ai-service: elegir Docker y especificar Dockerfile path (backend/Dockerfile, ai-service/Dockerfile)"
Write-Host "  - Para frontend: elegir Node, rootDir: frontend, buildCommand: npm ci, startCommand: npm run web"

Write-Host "\nSi quieres que el script intente crear servicios vía API, pásame la URL del repo y confirmo el payload."
