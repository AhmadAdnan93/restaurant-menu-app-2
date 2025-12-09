using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantMenu.API.Models.DTOs;
using RestaurantMenu.API.Services;
using System.Security.Claims;

namespace RestaurantMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public RestaurantsController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRestaurants([FromQuery] bool publishedOnly = true)
    {
        var restaurants = await _restaurantService.GetAllRestaurantsAsync(publishedOnly);
        return Ok(restaurants);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRestaurantById(string id)
    {
        var restaurant = await _restaurantService.GetRestaurantByIdAsync(id);
        if (restaurant == null) return NotFound();
        return Ok(restaurant);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetRestaurantBySlug(string slug)
    {
        var restaurant = await _restaurantService.GetRestaurantBySlugAsync(slug);
        if (restaurant == null) return NotFound();
        return Ok(restaurant);
    }

    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    [HttpPost]
    public async Task<IActionResult> CreateRestaurant([FromBody] RestaurantCreateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        try
        {
            var restaurant = await _restaurantService.CreateRestaurantAsync(dto, userId);
            return CreatedAtAction(nameof(GetRestaurantById), new { id = restaurant.Id }, restaurant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRestaurant(string id, [FromBody] RestaurantUpdateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        try
        {
            var restaurant = await _restaurantService.UpdateRestaurantAsync(
                id, 
                dto, 
                role == "SUPER_ADMIN" ? null : userId
            );
            return Ok(restaurant);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "SUPER_ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestaurant(string id)
    {
        var success = await _restaurantService.DeleteRestaurantAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "SUPER_ADMIN")]
    [HttpPost("{id}/assign-owner")]
    public async Task<IActionResult> AssignOwner(string id, [FromBody] AssignOwnerRequest request)
    {
        var success = await _restaurantService.AssignOwnerAsync(id, request.UserId);
        if (!success) return BadRequest();
        return Ok(new { message = "Owner assigned successfully" });
    }
}

public class AssignOwnerRequest
{
    public string UserId { get; set; } = string.Empty;
}

