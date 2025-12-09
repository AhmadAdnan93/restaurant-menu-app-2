using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;
using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public class RestaurantService : IRestaurantService
{
    private readonly ApplicationDbContext _context;

    public RestaurantService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RestaurantResponseDto> CreateRestaurantAsync(RestaurantCreateDto dto, string ownerUserId)
    {
        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Slug = dto.Slug,
            Logo = dto.Logo,
            CoverImage = dto.CoverImage,
            Description = dto.Description,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            Status = RestaurantStatus.PENDING
        };

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        // Assign owner
        var owner = new RestaurantOwner
        {
            UserId = ownerUserId,
            RestaurantId = restaurant.Id
        };
        _context.RestaurantOwners.Add(owner);
        await _context.SaveChangesAsync();

        return MapToResponse(restaurant);
    }

    public async Task<RestaurantResponseDto?> GetRestaurantByIdAsync(string id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Categories)
            .FirstOrDefaultAsync(r => r.Id == id);

        return restaurant == null ? null : MapToResponse(restaurant);
    }

    public async Task<RestaurantDetailDto?> GetRestaurantBySlugAsync(string slug)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Categories)
                .ThenInclude(c => c.MenuItems)
            .FirstOrDefaultAsync(r => r.Slug == slug && r.IsPublished);

        if (restaurant == null) return null;

        return new RestaurantDetailDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            Logo = restaurant.Logo,
            CoverImage = restaurant.CoverImage,
            Description = restaurant.Description,
            Status = restaurant.Status.ToString(),
            Phone = restaurant.Phone,
            Email = restaurant.Email,
            Website = restaurant.Website,
            Address = restaurant.Address,
            City = restaurant.City,
            Country = restaurant.Country,
            QrCode = restaurant.QrCode,
            IsPublished = restaurant.IsPublished,
            CategoryCount = restaurant.Categories.Count,
            CreatedAt = restaurant.CreatedAt,
            Categories = restaurant.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Order)
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    Order = c.Order,
                    IsActive = c.IsActive,
                    MenuItemCount = c.MenuItems.Count,
                    MenuItems = c.MenuItems
                        .Where(m => m.IsAvailable)
                        .OrderBy(m => m.Order)
                        .Select(m => new MenuItemResponseDto
                        {
                            Id = m.Id,
                            Name = m.Name,
                            Description = m.Description,
                            Price = m.Price,
                            Image = m.Image,
                            Order = m.Order,
                            IsAvailable = m.IsAvailable,
                            AverageRating = m.Ratings.Any() ? m.Ratings.Average(r => r.Value) : 0,
                            RatingCount = m.Ratings.Count
                        }).ToList()
                }).ToList()
        };
    }

    public async Task<List<RestaurantResponseDto>> GetAllRestaurantsAsync(bool publishedOnly = false)
    {
        var query = _context.Restaurants.Include(r => r.Categories).AsQueryable();

        if (publishedOnly)
        {
            query = query.Where(r => r.IsPublished && r.Status == RestaurantStatus.ACTIVE);
        }

        var restaurants = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

        return restaurants.Select(MapToResponse).ToList();
    }

    public async Task<RestaurantResponseDto> UpdateRestaurantAsync(string id, RestaurantUpdateDto dto, string? userId = null)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

        // Check ownership if userId provided
        if (userId != null)
        {
            var isOwner = await _context.RestaurantOwners
                .AnyAsync(ro => ro.RestaurantId == id && ro.UserId == userId);
            if (!isOwner) throw new UnauthorizedAccessException("Not authorized");
        }

        if (dto.Name != null) restaurant.Name = dto.Name;
        if (dto.Logo != null) restaurant.Logo = dto.Logo;
        if (dto.CoverImage != null) restaurant.CoverImage = dto.CoverImage;
        if (dto.Description != null) restaurant.Description = dto.Description;
        if (dto.Phone != null) restaurant.Phone = dto.Phone;
        if (dto.Email != null) restaurant.Email = dto.Email;
        if (dto.Website != null) restaurant.Website = dto.Website;
        if (dto.Address != null) restaurant.Address = dto.Address;
        if (dto.City != null) restaurant.City = dto.City;
        if (dto.Country != null) restaurant.Country = dto.Country;
        if (dto.Status != null) restaurant.Status = Enum.Parse<RestaurantStatus>(dto.Status);
        if (dto.IsPublished.HasValue) restaurant.IsPublished = dto.IsPublished.Value;

        restaurant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponse(restaurant);
    }

    public async Task<bool> DeleteRestaurantAsync(string id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null) return false;

        _context.Restaurants.Remove(restaurant);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignOwnerAsync(string restaurantId, string userId)
    {
        var exists = await _context.RestaurantOwners
            .AnyAsync(ro => ro.RestaurantId == restaurantId && ro.UserId == userId);
        if (exists) return false;

        var owner = new RestaurantOwner
        {
            RestaurantId = restaurantId,
            UserId = userId
        };

        _context.RestaurantOwners.Add(owner);
        await _context.SaveChangesAsync();
        return true;
    }

    private RestaurantResponseDto MapToResponse(Restaurant restaurant)
    {
        return new RestaurantResponseDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Slug = restaurant.Slug,
            Logo = restaurant.Logo,
            CoverImage = restaurant.CoverImage,
            Description = restaurant.Description,
            Status = restaurant.Status.ToString(),
            Phone = restaurant.Phone,
            Email = restaurant.Email,
            Website = restaurant.Website,
            Address = restaurant.Address,
            City = restaurant.City,
            Country = restaurant.Country,
            QrCode = restaurant.QrCode,
            IsPublished = restaurant.IsPublished,
            CategoryCount = restaurant.Categories.Count,
            CreatedAt = restaurant.CreatedAt
        };
    }
}

