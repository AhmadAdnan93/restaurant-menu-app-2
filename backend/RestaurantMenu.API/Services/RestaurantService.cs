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

    public async Task<RestaurantResponseDto> CreateRestaurantAsync(RestaurantCreateDto dto, string ownerUserId, bool isSuperAdmin = false)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new InvalidOperationException("Restaurant name is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Slug))
        {
            throw new InvalidOperationException("Restaurant slug is required.");
        }

        // Check if user already owns a restaurant (SUPER_ADMIN can own multiple)
        if (!isSuperAdmin)
        {
            var existingOwner = await _context.RestaurantOwners
                .FirstOrDefaultAsync(ro => ro.UserId == ownerUserId);

            if (existingOwner != null)
            {
                throw new InvalidOperationException("You already own a restaurant. Each user can only own one restaurant.");
            }
        }

        // Check if slug already exists
        var cleanSlug = dto.Slug.Trim().Replace("/menu/", "").TrimStart('/').TrimEnd('/');
        if (string.IsNullOrWhiteSpace(cleanSlug))
        {
            throw new InvalidOperationException("Restaurant slug cannot be empty after cleaning.");
        }

        var existingSlug = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Slug == cleanSlug);
        
        if (existingSlug != null)
        {
            throw new InvalidOperationException($"A restaurant with the slug '{cleanSlug}' already exists. Please choose a different slug.");
        }
        
        var restaurant = new Restaurant
        {
            Name = dto.Name,
            Slug = cleanSlug,
            Logo = dto.Logo,
            CoverImage = dto.CoverImage,
            Description = dto.Description,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            Status = RestaurantStatus.ACTIVE,
            IsPublished = true // Auto-publish new restaurants
        };

        try
        {
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
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            // Handle database constraint violations
            var innerException = ex.InnerException;
            if (innerException != null)
            {
                var errorMessage = innerException.Message;
                
                if (errorMessage.Contains("duplicate key") || errorMessage.Contains("UNIQUE constraint"))
                {
                    if (errorMessage.Contains("UserId") || errorMessage.Contains("RestaurantOwners"))
                    {
                        throw new InvalidOperationException("You already own a restaurant. Each user can only own one restaurant.", ex);
                    }
                    if (errorMessage.Contains("Slug") || errorMessage.Contains("Restaurants"))
                    {
                        throw new InvalidOperationException($"A restaurant with the slug '{cleanSlug}' already exists. Please choose a different slug.", ex);
                    }
                    if (errorMessage.Contains("QrCode"))
                    {
                        // Retry with a new QR code (very unlikely but handle it)
                        restaurant.QrCode = Guid.NewGuid().ToString();
                        await _context.SaveChangesAsync();
                        return MapToResponse(restaurant);
                    }
                }
            }
            throw new Exception($"Failed to create restaurant: {ex.Message}", ex);
        }
    }

    public async Task<RestaurantResponseDto?> GetRestaurantByIdAsync(string id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Categories)
                .ThenInclude(c => c.MenuItems)
                    .ThenInclude(m => m.Ratings)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null) return null;

        // Return detailed DTO with categories for admin panel
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
            CreatedAt = restaurant.CreatedAt,
            Categories = restaurant.Categories
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

    public async Task<RestaurantDetailDto?> GetRestaurantBySlugAsync(string slug)
    {
        // Clean slug - remove any leading slashes or /menu/ prefix
        var cleanSlug = slug.Trim().Replace("/menu/", "").TrimStart('/').TrimEnd('/');
        
        var restaurant = await _context.Restaurants
            .Include(r => r.Categories)
                .ThenInclude(c => c.MenuItems)
            .FirstOrDefaultAsync(r => r.Slug == cleanSlug && r.IsPublished);

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
        if (dto.Slug != null) 
        {
            // Clean slug - remove any leading slashes or /menu/ prefix
            var cleanSlug = dto.Slug.Trim();
            // Remove all /menu/ prefixes (handle multiple)
            while (cleanSlug.StartsWith("/menu/") || cleanSlug.StartsWith("menu/"))
            {
                cleanSlug = cleanSlug.Replace("/menu/", "").Replace("menu/", "");
            }
            cleanSlug = cleanSlug.TrimStart('/').TrimEnd('/');
            restaurant.Slug = cleanSlug;
        }
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

    public async Task<bool> DeleteRestaurantAsync(string id, string? userId = null)
    {
        Console.WriteLine($"=== DeleteRestaurantAsync ===");
        Console.WriteLine($"Restaurant ID: {id}");
        Console.WriteLine($"User ID: {userId ?? "null (SUPER_ADMIN)"}");
        
        var restaurant = await _context.Restaurants
            .Include(r => r.Owners)
            .FirstOrDefaultAsync(r => r.Id == id);
        
        if (restaurant == null)
        {
            Console.WriteLine("Restaurant not found");
            return false;
        }

        Console.WriteLine($"Restaurant found: {restaurant.Name}");
        Console.WriteLine($"Restaurant owners count: {restaurant.Owners.Count}");
        
        // If userId is provided, check if user owns this restaurant
        if (userId != null)
        {
            Console.WriteLine($"Checking ownership for user: {userId}");
            var owners = restaurant.Owners.ToList();
            foreach (var owner in owners)
            {
                Console.WriteLine($"  Owner: UserId={owner.UserId}, IsActive={owner.IsActive}");
            }
            
            var isOwner = restaurant.Owners.Any(o => o.UserId == userId && o.IsActive);
            Console.WriteLine($"Is owner: {isOwner}");
            
            if (!isOwner)
            {
                Console.WriteLine("ERROR: User does not own this restaurant");
                throw new UnauthorizedAccessException("You can only delete restaurants you own.");
            }
        }
        else
        {
            Console.WriteLine("SUPER_ADMIN deleting - no ownership check required");
        }

        // Delete associated data (cascade should handle this, but being explicit)
        Console.WriteLine("Deleting restaurant...");
        _context.Restaurants.Remove(restaurant);
        await _context.SaveChangesAsync();
        Console.WriteLine("Restaurant deleted successfully");
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

