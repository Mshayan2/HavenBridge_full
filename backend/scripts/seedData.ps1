$ErrorActionPreference = 'Continue'
$API = 'http://localhost:5000/api'

# Register user
Write-Host "Registering user..."
$regBody = '{"name":"Test User","email":"jabir2k1@gmail.com","password":"TestPassword123!"}'
try {
    $reg = Invoke-RestMethod -Uri "$API/auth/register" -Method POST -ContentType 'application/json' -Body $regBody
    Write-Host "Register result:" $reg.message
    if ($reg.debugVerifyUrl) {
        Write-Host "Debug verify URL found, verifying..."
        $token = ([uri]$reg.debugVerifyUrl).Query -replace '^\?token=',''
        $verify = Invoke-RestMethod -Uri "$API/auth/verify-email?token=$token" -Method GET
        Write-Host "Verify result:" $verify.message
    }
} catch {
    Write-Host "Register error (may already exist):" $_.Exception.Message
}

# Try to get debug URL via resend
Write-Host "Trying resend-verification..."
try {
    $resend = Invoke-RestMethod -Uri "$API/auth/resend-verification" -Method POST -ContentType 'application/json' -Body '{"email":"jabir2k1@gmail.com"}'
    Write-Host "Resend result:" $resend.message
    if ($resend.debugVerifyUrl) {
        Write-Host "Debug verify URL found, verifying..."
        $token = ([uri]$resend.debugVerifyUrl).Query -replace '^\?token=',''
        $verify = Invoke-RestMethod -Uri "$API/auth/verify-email?token=$token" -Method GET
        Write-Host "Verify result:" $verify.message
    }
} catch {
    Write-Host "Resend error:" $_.Exception.Message
}

# Login
Write-Host "Logging in..."
try {
    $login = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType 'application/json' -Body '{"email":"jabir2k1@gmail.com","password":"TestPassword123!"}'
    Write-Host "Login success, got token"
    $token = $login.accessToken
    
    # Create properties
    $headers = @{ 'Content-Type' = 'application/json'; 'Authorization' = "Bearer $token" }
    
    $props = @(
        '{"title":"Modern House in DHA","description":"Beautiful 3-bed house with garden","price":25000000,"location":"DHA Phase 5, Lahore","propertyType":"house","listingType":"sale","bedrooms":3,"bathrooms":2,"area":10,"areaUnit":"marla","features":["garden","parking"]}',
        '{"title":"Luxury Apartment in Gulberg","description":"Spacious apartment with city views","price":15000000,"location":"Gulberg III, Lahore","propertyType":"apartment","listingType":"sale","bedrooms":2,"bathrooms":2,"area":1200,"areaUnit":"sqft","features":["lift","security"]}',
        '{"title":"Commercial Plot in Johar Town","description":"Prime location commercial plot","price":50000000,"location":"Johar Town, Lahore","propertyType":"plot","listingType":"sale","area":1,"areaUnit":"kanal","features":["corner"]}'
    )
    
    foreach ($p in $props) {
        $prop = Invoke-RestMethod -Uri "$API/properties" -Method POST -Headers $headers -Body $p
        Write-Host "Created property:" $prop.title
    }
    
    Write-Host "Done seeding!"
} catch {
    Write-Host "Login/Property error:" $_.Exception.Message
}
