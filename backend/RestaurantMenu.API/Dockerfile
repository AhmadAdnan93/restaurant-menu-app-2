# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore
COPY *.csproj ./
RUN dotnet restore

# Copy source and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

COPY --from=build /app/publish ./
EXPOSE 8080

# Railway/Render inject PORT at runtime
CMD ["sh", "-c", "dotnet RestaurantMenu.API.dll --urls http://+:${PORT:-8080}"]
