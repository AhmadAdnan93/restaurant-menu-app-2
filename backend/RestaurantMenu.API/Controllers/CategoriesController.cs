using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantMenu.API.Models.DTOs;
using RestaurantMenu.API.Services;
using System.Security.Claims;

namespace RestaurantMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet("restaurant/{restaurantId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoriesByRestaurant(string restaurantId)
    {
        var categories = await _categoryService.GetCategoriesByRestaurantIdAsync(restaurantId);
        return Ok(categories);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryById(string id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost("restaurant/{restaurantId}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> CreateCategory(string restaurantId, [FromBody] CategoryCreateDto dto)
    {
        try
        {
            var category = await _categoryService.CreateCategoryAsync(restaurantId, dto);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] CategoryUpdateDto dto)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, dto);
            return Ok(category);
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
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}

