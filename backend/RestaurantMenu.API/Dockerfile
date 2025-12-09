FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["RestaurantMenu.API.csproj", "./"]
RUN dotnet restore "RestaurantMenu.API.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "RestaurantMenu.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RestaurantMenu.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "RestaurantMenu.API.dll"]

