@echo off
REM Run Spring Boot with Flyway clean and migrate
REM This will drop all database objects and recreate them from scratch

echo 🧹 Cleaning database...
call mvn flyway:clean
if errorlevel 1 (
    echo ❌ Flyway clean failed!
    exit /b 1
)

echo 📦 Running migrations...
call mvn flyway:migrate
if errorlevel 1 (
    echo ❌ Flyway migrate failed!
    exit /b 1
)

echo 🚀 Starting Spring Boot application...
call mvn spring-boot:run
