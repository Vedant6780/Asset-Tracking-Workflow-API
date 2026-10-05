# FleetTrack OS - Quick Start Script
# This script helps you start the application easily

Write-Host "🚛 FleetTrack OS - Application Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps *>$null
    $dockerRunning = $true
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting FleetTrack OS services..." -ForegroundColor Yellow
Write-Host ""

# Ask user which method to use
Write-Host "How would you like to start the application?" -ForegroundColor Cyan
Write-Host "1. Docker Compose (Recommended - All services together)" -ForegroundColor White
Write-Host "2. Individual services (Manual - More control)" -ForegroundColor White
Write-Host "3. Just check status and exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting with Docker Compose..." -ForegroundColor Green
        Write-Host ""
        Write-Host "This will:" -ForegroundColor Yellow
        Write-Host "  - Build all Docker images" -ForegroundColor White
        Write-Host "  - Start PostgreSQL database on port 5432" -ForegroundColor White
        Write-Host "  - Start FastAPI backend on port 8000" -ForegroundColor White
        Write-Host "  - Start React frontend on port 3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
        Write-Host ""
        
        Start-Sleep -Seconds 2
        
        docker-compose up --build
    }
    
    "2" {
        Write-Host ""
        Write-Host "Manual startup instructions:" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 1: Start PostgreSQL" -ForegroundColor Cyan
        Write-Host "  Open a terminal and run:" -ForegroundColor White
        Write-Host '  docker run -d --name fleettrack_postgres -e POSTGRES_DB=asset_tracking -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine' -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Step 2: Start Backend" -ForegroundColor Cyan
        Write-Host "  Open another terminal and run:" -ForegroundColor White
        Write-Host '  cd "d:\workflow API\backend"' -ForegroundColor Gray
        Write-Host '  .\venv\Scripts\activate' -ForegroundColor Gray
        Write-Host '  python -m uvicorn main:app --reload --port 8000' -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Step 3: Start Frontend" -ForegroundColor Cyan
        Write-Host "  Open another terminal and run:" -ForegroundColor White
        Write-Host '  cd "d:\workflow API\frontend"' -ForegroundColor Gray
        Write-Host '  npm run dev' -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "See START_APPLICATION.md for detailed instructions" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
    }
    
    "3" {
        Write-Host ""
        Write-Host "Checking current status..." -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "Docker Containers:" -ForegroundColor Cyan
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
        Write-Host ""
        Write-Host "Testing backend health..." -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -TimeoutSec 2
            Write-Host "✅ Backend is responding: $($response.service)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Backend is not responding on port 8000" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "Testing frontend..." -ForegroundColor Cyan
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 2
            Write-Host "✅ Frontend is responding on port 3000" -ForegroundColor Green
        } catch {
            Write-Host "❌ Frontend is not responding on port 3000" -ForegroundColor Red
        }
        
        Write-Host ""
        Read-Host "Press Enter to exit"
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again and choose 1, 2, or 3." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
    }
}

Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  - START_APPLICATION.md (Complete startup guide)" -ForegroundColor White
Write-Host "  - VERIFICATION_CHECKLIST.md (Testing checklist)" -ForegroundColor White
Write-Host ""
