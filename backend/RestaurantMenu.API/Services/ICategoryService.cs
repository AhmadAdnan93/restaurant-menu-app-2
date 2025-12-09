using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public interface ICategoryService
{
    Task<CategoryResponseDto> CreateCategoryAsync(string restaurantId, CategoryCreateDto dto);
    Task<CategoryResponseDto?> GetCategoryByIdAsync(string id);
    Task<List<CategoryResponseDto>> GetCategoriesByRestaurantIdAsync(string restaurantId);
    Task<CategoryResponseDto> UpdateCategoryAsync(string id, CategoryUpdateDto dto);
    Task<bool> DeleteCategoryAsync(string id);
}

