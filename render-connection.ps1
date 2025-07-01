# Render Database Connection PowerShell Script
# This script helps set up and test database connectivity for Render deployment

param(
    [string]$Action = "test",
    [switch]$SetupEnv,
    [switch]$TestConnection,
    [switch]$Deploy,
    [switch]$Help
)

# Color functions for better output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }

# Database configuration from your application.properties
$DB_CONFIG = @{
    Host = "db.ixwfkkkhetfijfnstsza.supabase.co"
    Port = "5432"
    Database = "postgres"
    Username = "postgres"
    Password = "Sreejay1804"  # Note: This should be moved to environment variables
    SSLMode = "require"
}

function Show-Help {
    Write-Info "=== Render Database Connection Script ==="
    Write-Host ""
    Write-Host "Usage: .\render-connection.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SetupEnv       Set up environment variables for Render"
    Write-Host "  -TestConnection Test database connection"
    Write-Host "  -Deploy         Prepare for Render deployment"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\render-connection.ps1 -TestConnection"
    Write-Host "  .\render-connection.ps1 -SetupEnv"
    Write-Host "  .\render-connection.ps1 -Deploy"
}

function Test-DatabaseConnection {
    Write-Info "Testing database connection..."
    
    try {
        # Test using psql if available
        $connectionString = "postgresql://$($DB_CONFIG.Username):$($DB_CONFIG.Password)@$($DB_CONFIG.Host):$($DB_CONFIG.Port)/$($DB_CONFIG.Database)?sslmode=$($DB_CONFIG.SSLMode)"
        
        Write-Info "Connection details:"
        Write-Host "  Host: $($DB_CONFIG.Host)"
        Write-Host "  Port: $($DB_CONFIG.Port)"
        Write-Host "  Database: $($DB_CONFIG.Database)"
        Write-Host "  Username: $($DB_CONFIG.Username)"
        Write-Host "  SSL Mode: $($DB_CONFIG.SSLMode)"
        
        # Try to test connection with PowerShell if PostgreSQL client is available
        if (Get-Command psql -ErrorAction SilentlyContinue) {
            Write-Info "Testing connection with psql..."
            $env:PGPASSWORD = $DB_CONFIG.Password
            $result = psql -h $DB_CONFIG.Host -p $DB_CONFIG.Port -U $DB_CONFIG.Username -d $DB_CONFIG.Database -c "SELECT version();" 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "[SUCCESS] Database connection successful!"
                Write-Host "Database version: $($result | Select-String 'PostgreSQL')"
            } else {
                Write-Error "[ERROR] Database connection failed!"
                Write-Host $result
            }
        } else {
            Write-Warning "psql not found. Install PostgreSQL client to test connection."
            Write-Info "Connection string (for manual testing):"
            Write-Host $connectionString
        }
        
    } catch {
        Write-Error "Connection test failed: $($_.Exception.Message)"
    }
}

function Setup-EnvironmentVariables {
    Write-Info "Setting up environment variables for Render..."
    
    # Create .env file for local development
    $envLines = @(
        "# Database Configuration for Render",
        "DATABASE_URL=postgresql://$($DB_CONFIG.Username):$($DB_CONFIG.Password)@$($DB_CONFIG.Host):$($DB_CONFIG.Port)/$($DB_CONFIG.Database)?sslmode=$($DB_CONFIG.SSLMode)",
        "DB_HOST=$($DB_CONFIG.Host)",
        "DB_PORT=$($DB_CONFIG.Port)",
        "DB_NAME=$($DB_CONFIG.Database)",
        "DB_USER=$($DB_CONFIG.Username)",
        "DB_PASSWORD=$($DB_CONFIG.Password)",
        "DB_SSL_MODE=$($DB_CONFIG.SSLMode)",
        "",
        "# Server Configuration",
        "PORT=8080",
        "SPRING_PROFILES_ACTIVE=production",
        "",
        "# CORS Configuration",
        "CORS_ALLOWED_ORIGINS=https://your-frontend-app.onrender.com"
    )

    $envLines | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "[SUCCESS] .env file created"
    
    # Display environment variables for Render dashboard
    Write-Info "`nEnvironment variables to set in Render dashboard:"
    Write-Host "DATABASE_URL = postgresql://$($DB_CONFIG.Username):$($DB_CONFIG.Password)@$($DB_CONFIG.Host):$($DB_CONFIG.Port)/$($DB_CONFIG.Database)?sslmode=$($DB_CONFIG.SSLMode)"
    Write-Host "PORT = 8080"
    Write-Host "SPRING_PROFILES_ACTIVE = production"
    Write-Host "CORS_ALLOWED_ORIGINS = https://your-frontend-app.onrender.com"
    
    Write-Warning "`nSecurity Note: Never commit passwords to version control!"
    Write-Info "Consider using Render's secret management for sensitive data."
}

function Prepare-RenderDeployment {
    Write-Info "Preparing for Render deployment..."
    
    # Check if we're in the right directory or if backend folder exists
    $backendPath = ""
    if (Test-Path "backend/pom.xml") {
        $backendPath = "backend/"
        Write-Info "Found backend folder structure"
    } elseif (Test-Path "pom.xml") {
        $backendPath = ""
        Write-Info "Found Java project in current directory"
    } else {
        Write-Error "Could not find Java project. Please run from project root or backend directory."
        return
    }
    
    # Check if required files exist
    $requiredFiles = @("pom.xml", "src/main/java", "src/main/resources/application.properties")
    $missingFiles = @()
    
    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $backendPath $file
        if (-not (Test-Path $fullPath)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Error "Missing required files in ${backendPath}:"
        $missingFiles | ForEach-Object { Write-Host "  - $_" }
        return
    }
    
    Write-Success "[SUCCESS] All required files found"
    
    # Check if required files exist
    Write-Info "`n=== Render Deployment Configuration ==="
    if ($backendPath -eq "backend/") {
        Write-Host "Build Command: cd backend && ./mvnw clean package -DskipTests"
        Write-Host "Start Command: cd backend && java -jar target/*.jar"
        Write-Info "Note: Your project is in a backend subdirectory"
    } else {
        Write-Host "Build Command: ./mvnw clean package -DskipTests"
        Write-Host "Start Command: java -jar target/*.jar"
    }
    Write-Host "Environment: Java"
    Write-Host "Java Version: 17 (or your preferred version)"
    
    # Create a sample render.yaml using array approach
    $renderLines = @(
        "services:",
        "  - type: web",
        "    name: ecommerce-backend",
        "    env: java"
    )
    
    if ($backendPath -eq "backend/") {
        $renderLines += @(
            "    buildCommand: cd backend && ./mvnw clean package -DskipTests",
            "    startCommand: cd backend && java -jar target/*.jar"
        )
    } else {
        $renderLines += @(
            "    buildCommand: ./mvnw clean package -DskipTests",
            "    startCommand: java -jar target/*.jar"
        )
    }
    
    $renderLines += @(
        "    envVars:",
        "      - key: DATABASE_URL",
        "        value: postgresql://$($DB_CONFIG.Username):$($DB_CONFIG.Password)@$($DB_CONFIG.Host):$($DB_CONFIG.Port)/$($DB_CONFIG.Database)?sslmode=$($DB_CONFIG.SSLMode)",
        "      - key: PORT",
        "        value: 8080",
        "      - key: SPRING_PROFILES_ACTIVE",
        "        value: production"
    )

    $renderLines | Out-File -FilePath "render.yaml" -Encoding UTF8
    Write-Success "[SUCCESS] render.yaml configuration file created"
    
    # Check Maven wrapper
    $mvnwPath = Join-Path $backendPath "mvnw"
    if (Test-Path $mvnwPath) {
        Write-Success "[SUCCESS] Maven wrapper found at $mvnwPath"
    } else {
        Write-Warning "Maven wrapper (mvnw) not found at $mvnwPath. You may need to run: mvn wrapper:wrapper"
    }
    
    Write-Info "`n=== Deployment Checklist ==="
    Write-Host "1. [DONE] Database connection configured"
    Write-Host "2. [DONE] Environment variables prepared"
    Write-Host "3. [DONE] Build configuration ready"
    Write-Host "4. [TODO] Update CORS origins in Render dashboard"
    Write-Host "5. [TODO] Set environment variables in Render dashboard"
    Write-Host "6. [TODO] Deploy to Render"
    Write-Host "7. [TODO] Test deployed application"
}

function Test-JavaApplication {
    Write-Info "Testing Java application locally..."
    
    # Check if we're in the right directory or if backend folder exists
    $backendPath = ""
    if (Test-Path "backend/pom.xml") {
        $backendPath = "backend/"
        Write-Info "Found backend folder structure"
    } elseif (Test-Path "pom.xml") {
        $backendPath = ""
        Write-Info "Found Java project in current directory"
    } else {
        Write-Warning "Could not find Java project. Skipping tests."
        return
    }
    
    $mvnwPath = Join-Path $backendPath "mvnw"
    if (Test-Path $mvnwPath) {
        Write-Info "Running Maven tests..."
        if ($backendPath -eq "backend/") {
            Set-Location backend
            ./mvnw test
            Set-Location ..
        } else {
            ./mvnw test
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "[SUCCESS] Tests passed"
        } else {
            Write-Error "[ERROR] Tests failed"
        }
    } else {
        Write-Warning "Maven wrapper not found at $mvnwPath. Run: mvn test"
    }
}

# Main script logic
Write-Info "=== Render Database Connection Script ==="

# Debug: Show current directory and contents
Write-Info "Current directory: $(Get-Location)"
Write-Info "Directory contents:"
Get-ChildItem | Select-Object Name, Mode | Format-Table -AutoSize

if ($Help) {
    Show-Help
    exit 0
}

if ($SetupEnv) {
    Setup-EnvironmentVariables
}

if ($TestConnection) {
    Test-DatabaseConnection
}

if ($Deploy) {
    Prepare-RenderDeployment
}

# Default behavior
if (-not $SetupEnv -and -not $TestConnection -and -not $Deploy) {
    Write-Info "Running default actions..."
    Test-DatabaseConnection
    Setup-EnvironmentVariables
    Prepare-RenderDeployment
    Test-JavaApplication
}

Write-Info "`n=== Script completed ==="
Write-Host "For more options, run: .\render-connection.ps1 -Help"