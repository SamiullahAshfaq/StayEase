# Run Spring Boot with Flyway clean and migrate
# This will drop all database objects and recreate them from scratch

Write-Host "Cleaning database..." -ForegroundColor Yellow
mvn flyway:clean

if ($LASTEXITCODE -ne 0) {
    Write-Host "Flyway clean failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Running migrations..." -ForegroundColor Cyan
mvn flyway:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Flyway migrate failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Starting Spring Boot application..." -ForegroundColor Green
mvn spring-boot:run
