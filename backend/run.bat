@echo off
REM Run Spring Boot without cleaning database
REM Use this when you want to keep your existing data

echo 🚀 Starting Spring Boot application...
call mvn spring-boot:run
