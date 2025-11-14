# Power Apps Integration Test Scripts (PowerShell)
# Test the Power Apps integration endpoints

# Configuration
$BASE_URL = "http://localhost:3001"
$API_TOKEN = "your_jwt_token_here"  # Replace with actual token from login

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Power Apps Integration Test Suite" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Function to make API calls
function Invoke-PowerAppsAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$RequiresAuth = $false
    )
    
    $url = "$BASE_URL$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($RequiresAuth) {
        $headers["Authorization"] = "Bearer $API_TOKEN"
    }
    
    try {
        $params = @{
            Uri     = $url
            Method  = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 1: Health Check" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: GET /api/power-apps/health`n"

$result = Invoke-PowerAppsAPI -Method "GET" -Endpoint "/api/power-apps/health"
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 2: Get Forms from Power Apps
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 2: Get Forms from Power Apps" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: GET /api/power-apps/forms`n"

$result = Invoke-PowerAppsAPI -Method "GET" -Endpoint "/api/power-apps/forms" -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 3: Get Responses from Power Apps
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 3: Get Responses from Power Apps" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: GET /api/power-apps/responses`n"

$result = Invoke-PowerAppsAPI -Method "GET" -Endpoint "/api/power-apps/responses" -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 4: Sync a Single Form
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 4: Sync a Single Form (ID: 1)" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: POST /api/power-apps/sync-form"
Write-Host "Body: { formId: 1 }`n"

$body = @{ formId = 1 }
$result = Invoke-PowerAppsAPI -Method "POST" -Endpoint "/api/power-apps/sync-form" -Body $body -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 5: Sync a Single Response
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 5: Sync a Single Response (ID: 1)" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: POST /api/power-apps/sync-response"
Write-Host "Body: { responseId: 1 }`n"

$body = @{ responseId = 1 }
$result = Invoke-PowerAppsAPI -Method "POST" -Endpoint "/api/power-apps/sync-response" -Body $body -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 6: Bulk Sync All Forms
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 6: Bulk Sync All Forms" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: POST /api/power-apps/sync-all-forms"
Write-Host "(Note: Requires ADMIN role)`n"

$result = Invoke-PowerAppsAPI -Method "POST" -Endpoint "/api/power-apps/sync-all-forms" -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 7: Bulk Sync All Responses
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 7: Bulk Sync All Responses" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: POST /api/power-apps/sync-all-responses"
Write-Host "(Note: Requires ADMIN role)`n"

$result = Invoke-PowerAppsAPI -Method "POST" -Endpoint "/api/power-apps/sync-all-responses" -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Test 8: Setup Webhooks
Write-Host "`n" + ("="*40) -ForegroundColor Blue
Write-Host "Test 8: Setup Webhooks" -ForegroundColor Blue
Write-Host ("="*40) -ForegroundColor Blue
Write-Host "Endpoint: POST /api/power-apps/setup-webhooks"
Write-Host "(Note: Requires ADMIN role)`n"

$result = Invoke-PowerAppsAPI -Method "POST" -Endpoint "/api/power-apps/setup-webhooks" -RequiresAuth $true
$result | ConvertTo-Json -Depth 3 | Write-Host

# Summary
Write-Host "`n" + ("="*40) -ForegroundColor Cyan
Write-Host "Test Suite Complete" -ForegroundColor Cyan
Write-Host ("="*40) -ForegroundColor Cyan

Write-Host "`nTips:" -ForegroundColor Green
Write-Host "1. Replace `$API_TOKEN with actual JWT token from login"
Write-Host "2. Tests 6-8 require ADMIN role"
Write-Host "3. Ensure Power Apps credentials are configured in .env"
Write-Host "4. Check logs for detailed error information"
Write-Host "5. Update formId/responseId in tests for your specific data"
