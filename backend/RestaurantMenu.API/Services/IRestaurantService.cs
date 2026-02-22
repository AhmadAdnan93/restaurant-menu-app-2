using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public interface IRestaurantService
{
    Task<RestaurantResponseDto> CreateRestaurantAsync(RestaurantCreateDto dto, string ownerUserId, bool isSuperAdmin = false);
    Task<RestaurantResponseDto?> GetRestaurantByIdAsync(string id);
    Task<RestaurantDetailDto?> GetRestaurantBySlugAsync(string slug);
    Task<List<RestaurantResponseDto>> GetAllRestaurantsAsync(bool publishedOnly = false);
    Task<RestaurantResponseDto> UpdateRestaurantAsync(string id, RestaurantUpdateDto dto, string? userId = null);
    Task<bool> DeleteRestaurantAsync(string id, string? userId = null);
    Task<bool> AssignOwnerAsync(string restaurantId, string userId);
}

