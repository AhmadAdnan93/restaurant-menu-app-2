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
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var isSuperAdmin = role == "SUPER_ADMIN";

        // Log incoming data for debugging
        Console.WriteLine($"=== Create Restaurant Request ===");
        Console.WriteLine($"UserId: {userId}, Role: {role}");
        Console.WriteLine($"Name: {dto?.Name ?? "null"}");
        Console.WriteLine($"Slug: {dto?.Slug ?? "null"}");
        Console.WriteLine($"Logo: {dto?.Logo ?? "null"}");
        Console.WriteLine($"CoverImage: {dto?.CoverImage ?? "null"}");
        Console.WriteLine($"Description: {dto?.Description ?? "null"}");

        try
        {
            var restaurant = await _restaurantService.CreateRestaurantAsync(dto, userId, isSuperAdmin);
            Console.WriteLine($"Restaurant created successfully: {restaurant.Id}");
            return CreatedAtAction(nameof(GetRestaurantById), new { id = restaurant.Id }, restaurant);
        }
        catch (InvalidOperationException ex)
        {
            // User-friendly validation errors
            Console.WriteLine($"InvalidOperationException: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the full error for debugging
            Console.WriteLine($"=== ERROR CREATING RESTAURANT ===");
            Console.WriteLine($"Error Type: {ex.GetType().Name}");
            Console.WriteLine($"Error Message: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception Type: {ex.InnerException.GetType().Name}");
                Console.WriteLine($"Inner Exception Message: {ex.InnerException.Message}");
                Console.WriteLine($"Inner Exception Stack: {ex.InnerException.StackTrace}");
            }
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            Console.WriteLine($"=================================");
            
            // Return user-friendly error message
            var errorMessage = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message = errorMessage });
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

    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestaurant(string id)
    {
        Console.WriteLine($"=== DELETE Restaurant Request ===");
        Console.WriteLine($"Restaurant ID: {id}");
        Console.WriteLine($"User authenticated: {User.Identity?.IsAuthenticated}");
        Console.WriteLine($"User name: {User.Identity?.Name}");
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        
        Console.WriteLine($"User ID: {userId}");
        Console.WriteLine($"User Role: {role}");
        
        if (userId == null)
        {
            Console.WriteLine("ERROR: User ID is null - authentication failed");
            return Unauthorized(new { message = "User not authenticated" });
        }

        try
        {
            var success = await _restaurantService.DeleteRestaurantAsync(
                id, 
                role == "SUPER_ADMIN" ? null : userId
            );
            if (!success) return NotFound();
            Console.WriteLine($"Restaurant deleted successfully: {id}");
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"UnauthorizedAccessException: {ex.Message}");
            return Forbid();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting restaurant: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { message = ex.Message });
        }
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

