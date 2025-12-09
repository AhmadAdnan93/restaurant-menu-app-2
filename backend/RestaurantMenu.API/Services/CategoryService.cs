using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;
using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryResponseDto> CreateCategoryAsync(string restaurantId, CategoryCreateDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            Order = dto.Order,
            RestaurantId = restaurantId,
            IsActive = true
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<CategoryResponseDto?> GetCategoryByIdAsync(string id)
    {
        var category = await _context.Categories
            .Include(c => c.MenuItems)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category == null ? null : MapToResponse(category);
    }

    public async Task<List<CategoryResponseDto>> GetCategoriesByRestaurantIdAsync(string restaurantId)
    {
        var categories = await _context.Categories
            .Include(c => c.MenuItems)
            .Where(c => c.RestaurantId == restaurantId && c.IsActive)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return categories.Select(MapToResponse).ToList();
    }

    public async Task<CategoryResponseDto> UpdateCategoryAsync(string id, CategoryUpdateDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) throw new KeyNotFoundException("Category not found");

        if (dto.Name != null) category.Name = dto.Name;
        if (dto.Description != null) category.Description = dto.Description;
        if (dto.Order.HasValue) category.Order = dto.Order.Value;
        if (dto.IsActive.HasValue) category.IsActive = dto.IsActive.Value;

        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<bool> DeleteCategoryAsync(string id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    private CategoryResponseDto MapToResponse(Category category)
    {
        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            Order = category.Order,
            IsActive = category.IsActive,
            MenuItemCount = category.MenuItems.Count,
            MenuItems = category.MenuItems
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
        };
    }
}

