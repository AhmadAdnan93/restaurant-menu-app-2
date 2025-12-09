# 🚀 Restaurant Menu App - .NET Web API Backend

## 📋 Project Structure

```
backend/
├── RestaurantMenu.API/          # Main API Project
│   ├── Controllers/             # API Controllers
│   ├── Services/                # Business Logic
│   ├── Models/                  # Data Models & DTOs
│   ├── Data/                    # Database Context
│   ├── Middleware/              # Custom Middleware
│   └── Program.cs               # Application Entry
│
├── RestaurantMenu.Core/         # Core Domain Models
├── RestaurantMenu.Infrastructure/ # Database & External Services
└── RestaurantMenu.Application/   # Application Layer
```

## 🔧 Setup Instructions

### Prerequisites
- .NET 8 SDK
- PostgreSQL Database
- Visual Studio 2022 or VS Code

### Installation
```bash
cd backend/RestaurantMenu.API
dotnet restore
dotnet build
dotnet run
```

### Environment Variables
Create `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your-postgresql-connection-string"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-min-32-chars",
    "Issuer": "RestaurantMenuAPI",
    "Audience": "RestaurantMenuApp",
    "ExpirationMinutes": 60
  },
  "PayPal": {
    "ClientId": "your-paypal-client-id",
    "ClientSecret": "your-paypal-secret",
    "Mode": "sandbox"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3001", "https://your-frontend.vercel.app"]
  }
}
```

