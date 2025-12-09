using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantMenu.API.Models.DTOs;
using RestaurantMenu.API.Services;

namespace RestaurantMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemsController : ControllerBase
{
    private readonly IMenuItemService _menuItemService;

    public MenuItemsController(IMenuItemService menuItemService)
    {
        _menuItemService = menuItemService;
    }

    [HttpGet("category/{categoryId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMenuItemsByCategory(string categoryId)
    {
        var menuItems = await _menuItemService.GetMenuItemsByCategoryIdAsync(categoryId);
        return Ok(menuItems);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMenuItemById(string id)
    {
        var menuItem = await _menuItemService.GetMenuItemByIdAsync(id);
        if (menuItem == null) return NotFound();
        return Ok(menuItem);
    }

    [HttpPost("category/{categoryId}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> CreateMenuItem(string categoryId, [FromBody] MenuItemCreateDto dto)
    {
        try
        {
            var menuItem = await _menuItemService.CreateMenuItemAsync(categoryId, dto);
            return CreatedAtAction(nameof(GetMenuItemById), new { id = menuItem.Id }, menuItem);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> UpdateMenuItem(string id, [FromBody] MenuItemUpdateDto dto)
    {
        try
        {
            var menuItem = await _menuItemService.UpdateMenuItemAsync(id, dto);
            return Ok(menuItem);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> DeleteMenuItem(string id)
    {
        var success = await _menuItemService.DeleteMenuItemAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}

