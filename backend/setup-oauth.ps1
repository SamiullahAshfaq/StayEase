# OAuth2 Setup Helper Script for Windows PowerShell
# This script helps you configure OAuth2 for StayEase

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "StayEase OAuth2 Configuration Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envPath = ".env"
$envTemplatePath = ".env.template"

if (Test-Path $envPath) {
    Write-Host "[!] .env file already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "[X] Setup cancelled" -ForegroundColor Red
        exit
    }
}

# Copy template
if (Test-Path $envTemplatePath) {
    Copy-Item $envTemplatePath $envPath
    Write-Host "[✓] Created .env file from template" -ForegroundColor Green
} else {
    Write-Host "[X] .env.template not found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Google OAuth2 Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor Yellow
Write-Host "2. Create a new project or select existing one" -ForegroundColor Yellow
Write-Host "3. Enable Google+ API" -ForegroundColor Yellow
Write-Host "4. Create OAuth 2.0 Client ID (Web application)" -ForegroundColor Yellow
Write-Host "5. Add redirect URIs:" -ForegroundColor Yellow
Write-Host "   - http://localhost:8080/oauth2/callback/google" -ForegroundColor Gray
Write-Host "   - http://localhost:8080/login/oauth2/code/google" -ForegroundColor Gray
Write-Host ""

$googleClientId = Read-Host "Enter your Google Client ID"
$googleClientSecret = Read-Host "Enter your Google Client Secret" -AsSecureString
$googleClientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($googleClientSecret)
)

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Facebook OAuth2 Configuration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://developers.facebook.com/" -ForegroundColor Yellow
Write-Host "2. Create a new app" -ForegroundColor Yellow
Write-Host "3. Add Facebook Login product" -ForegroundColor Yellow
Write-Host "4. Configure OAuth redirect URIs:" -ForegroundColor Yellow
Write-Host "   - http://localhost:8080/oauth2/callback/facebook" -ForegroundColor Gray
Write-Host "   - http://localhost:8080/login/oauth2/code/facebook" -ForegroundColor Gray
Write-Host ""

$facebookAppId = Read-Host "Enter your Facebook App ID"
$facebookAppSecret = Read-Host "Enter your Facebook App Secret" -AsSecureString
$facebookAppSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($facebookAppSecret)
)

# Update .env file
$envContent = Get-Content $envPath

$envContent = $envContent -replace 'GOOGLE_CLIENT_ID=.*', "GOOGLE_CLIENT_ID=$googleClientId"
$envContent = $envContent -replace 'GOOGLE_CLIENT_SECRET=.*', "GOOGLE_CLIENT_SECRET=$googleClientSecretPlain"
$envContent = $envContent -replace 'FACEBOOK_APP_ID=.*', "FACEBOOK_APP_ID=$facebookAppId"
$envContent = $envContent -replace 'FACEBOOK_APP_SECRET=.*', "FACEBOOK_APP_SECRET=$facebookAppSecretPlain"

$envContent | Set-Content $envPath

Write-Host ""
Write-Host "[✓] Configuration saved to .env file" -ForegroundColor Green
Write-Host ""

# Display summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Google Client ID: $googleClientId" -ForegroundColor Gray
Write-Host "Google Client Secret: ****" -ForegroundColor Gray
Write-Host "Facebook App ID: $facebookAppId" -ForegroundColor Gray
Write-Host "Facebook App Secret: ****" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor Yellow
Write-Host "2. Start the backend server:" -ForegroundColor Yellow
Write-Host "   .\mvnw spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. In another terminal, start the frontend:" -ForegroundColor Yellow
Write-Host "   cd ..\frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test OAuth flow:" -ForegroundColor Yellow
Write-Host "   - Open http://localhost:4200" -ForegroundColor Gray
Write-Host "   - Try Google login" -ForegroundColor Gray
Write-Host "   - Try Facebook login" -ForegroundColor Gray
Write-Host ""
Write-Host "[✓] Setup complete!" -ForegroundColor Green
Write-Host ""
