using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantMenu.API.Models.DTOs;
using RestaurantMenu.API.Services;
using System.Security.Claims;

namespace RestaurantMenu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        try
        {
            var order = await _orderService.CreateOrderAsync(dto, userId);
            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpGet("number/{orderNumber}")]
    [Authorize]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber)
    {
        var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpGet("restaurant/{restaurantId}")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> GetOrdersByRestaurant(string restaurantId)
    {
        var orders = await _orderService.GetOrdersByRestaurantIdAsync(restaurantId);
        return Ok(orders);
    }

    [HttpGet("my-orders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var orders = await _orderService.GetOrdersByUserIdAsync(userId);
        return Ok(orders);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "SUPER_ADMIN,RESTAURANT_OWNER")]
    public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] OrderUpdateStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, dto);
            return Ok(order);
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

    [HttpPost("{id}/cancel")]
    [Authorize]
    public async Task<IActionResult> CancelOrder(string id)
    {
        var success = await _orderService.CancelOrderAsync(id);
        if (!success) return BadRequest(new { message = "Cannot cancel this order" });
        return Ok(new { message = "Order cancelled successfully" });
    }
}

