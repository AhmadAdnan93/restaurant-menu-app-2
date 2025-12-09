using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, string? userId = null);
    Task<OrderResponseDto?> GetOrderByIdAsync(string id);
    Task<OrderResponseDto?> GetOrderByOrderNumberAsync(string orderNumber);
    Task<List<OrderResponseDto>> GetOrdersByRestaurantIdAsync(string restaurantId);
    Task<List<OrderResponseDto>> GetOrdersByUserIdAsync(string userId);
    Task<OrderResponseDto> UpdateOrderStatusAsync(string id, OrderUpdateStatusDto dto);
    Task<bool> CancelOrderAsync(string id);
}

