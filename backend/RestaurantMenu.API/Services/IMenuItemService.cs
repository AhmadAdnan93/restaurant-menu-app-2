using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public interface IMenuItemService
{
    Task<MenuItemResponseDto> CreateMenuItemAsync(string categoryId, MenuItemCreateDto dto);
    Task<MenuItemResponseDto?> GetMenuItemByIdAsync(string id);
    Task<List<MenuItemResponseDto>> GetMenuItemsByCategoryIdAsync(string categoryId);
    Task<MenuItemResponseDto> UpdateMenuItemAsync(string id, MenuItemUpdateDto dto);
    Task<bool> DeleteMenuItemAsync(string id);
}

