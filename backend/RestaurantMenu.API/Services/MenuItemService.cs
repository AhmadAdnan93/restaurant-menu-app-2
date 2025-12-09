using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;
using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public class MenuItemService : IMenuItemService
{
    private readonly ApplicationDbContext _context;

    public MenuItemService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MenuItemResponseDto> CreateMenuItemAsync(string categoryId, MenuItemCreateDto dto)
    {
        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null) throw new KeyNotFoundException("Category not found");

        var menuItem = new MenuItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Image = dto.Image,
            Order = dto.Order,
            CategoryId = categoryId,
            IsAvailable = true
        };

        _context.MenuItems.Add(menuItem);
        await _context.SaveChangesAsync();

        return await GetMenuItemByIdAsync(menuItem.Id) ?? throw new Exception("Failed to create menu item");
    }

    public async Task<MenuItemResponseDto?> GetMenuItemByIdAsync(string id)
    {
        var menuItem = await _context.MenuItems
            .Include(m => m.Ratings)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menuItem == null) return null;

        return new MenuItemResponseDto
        {
            Id = menuItem.Id,
            Name = menuItem.Name,
            Description = menuItem.Description,
            Price = menuItem.Price,
            Image = menuItem.Image,
            Order = menuItem.Order,
            IsAvailable = menuItem.IsAvailable,
            AverageRating = menuItem.Ratings.Any() ? menuItem.Ratings.Average(r => r.Value) : 0,
            RatingCount = menuItem.Ratings.Count
        };
    }

    public async Task<List<MenuItemResponseDto>> GetMenuItemsByCategoryIdAsync(string categoryId)
    {
        var menuItems = await _context.MenuItems
            .Include(m => m.Ratings)
            .Where(m => m.CategoryId == categoryId && m.IsAvailable)
            .OrderBy(m => m.Order)
            .ToListAsync();

        return menuItems.Select(m => new MenuItemResponseDto
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
        }).ToList();
    }

    public async Task<MenuItemResponseDto> UpdateMenuItemAsync(string id, MenuItemUpdateDto dto)
    {
        var menuItem = await _context.MenuItems.FindAsync(id);
        if (menuItem == null) throw new KeyNotFoundException("Menu item not found");

        if (dto.Name != null) menuItem.Name = dto.Name;
        if (dto.Description != null) menuItem.Description = dto.Description;
        if (dto.Price.HasValue) menuItem.Price = dto.Price.Value;
        if (dto.Image != null) menuItem.Image = dto.Image;
        if (dto.Order.HasValue) menuItem.Order = dto.Order.Value;
        if (dto.IsAvailable.HasValue) menuItem.IsAvailable = dto.IsAvailable.Value;

        menuItem.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetMenuItemByIdAsync(id) ?? throw new Exception("Failed to update menu item");
    }

    public async Task<bool> DeleteMenuItemAsync(string id)
    {
        var menuItem = await _context.MenuItems.FindAsync(id);
        if (menuItem == null) return false;

        _context.MenuItems.Remove(menuItem);
        await _context.SaveChangesAsync();
        return true;
    }
}

