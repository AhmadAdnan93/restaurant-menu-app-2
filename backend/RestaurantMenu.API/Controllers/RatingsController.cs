using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;

namespace RestaurantMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RatingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateRating([FromBody] CreateRatingRequest request)
    {
        var menuItem = await _context.MenuItems.FindAsync(request.MenuItemId);
        if (menuItem == null) return NotFound(new { message = "Menu item not found" });

        if (request.Value < 1 || request.Value > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5" });
        }

        var rating = new Rating
        {
            MenuItemId = request.MenuItemId,
            Value = request.Value,
            Comment = request.Comment,
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName
        };

        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        return Ok(new { id = rating.Id, message = "Rating added successfully" });
    }

    [HttpGet("menu-item/{menuItemId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRatingsByMenuItem(string menuItemId)
    {
        var ratings = await _context.Ratings
            .Where(r => r.MenuItemId == menuItemId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(ratings);
    }
}

public class CreateRatingRequest
{
    public string MenuItemId { get; set; } = string.Empty;
    public int Value { get; set; }
    public string? Comment { get; set; }
    public string? CustomerId { get; set; }
    public string? CustomerName { get; set; }
}

