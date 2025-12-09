using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;
using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;

    public OrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(OrderCreateDto dto, string? userId = null)
    {
        var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
        if (restaurant == null) throw new KeyNotFoundException("Restaurant not found");

        var orderNumber = GenerateOrderNumber();
        var order = new Order
        {
            OrderNumber = orderNumber,
            RestaurantId = dto.RestaurantId,
            UserId = userId,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            CustomerPhone = dto.CustomerPhone,
            Notes = dto.Notes,
            Status = OrderStatus.PENDING
        };

        decimal totalAmount = 0;

        foreach (var itemDto in dto.Items)
        {
            var menuItem = await _context.MenuItems.FindAsync(itemDto.MenuItemId);
            if (menuItem == null || !menuItem.IsAvailable)
                throw new InvalidOperationException($"Menu item {itemDto.MenuItemId} not found or unavailable");

            var subtotal = menuItem.Price * itemDto.Quantity;
            totalAmount += subtotal;

            var orderItem = new OrderItem
            {
                Order = order,
                MenuItemId = itemDto.MenuItemId,
                Quantity = itemDto.Quantity,
                Price = menuItem.Price,
                Subtotal = subtotal
            };

            order.OrderItems.Add(orderItem);
        }

        order.TotalAmount = totalAmount;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return await GetOrderByIdAsync(order.Id) ?? throw new Exception("Failed to create order");
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(string id)
    {
        var order = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToResponse(order);
    }

    public async Task<OrderResponseDto?> GetOrderByOrderNumberAsync(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        return order == null ? null : MapToResponse(order);
    }

    public async Task<List<OrderResponseDto>> GetOrdersByRestaurantIdAsync(string restaurantId)
    {
        var orders = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Payment)
            .Where(o => o.RestaurantId == restaurantId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToResponse).ToList();
    }

    public async Task<List<OrderResponseDto>> GetOrdersByUserIdAsync(string userId)
    {
        var orders = await _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Payment)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapToResponse).ToList();
    }

    public async Task<OrderResponseDto> UpdateOrderStatusAsync(string id, OrderUpdateStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) throw new KeyNotFoundException("Order not found");

        var newStatus = Enum.Parse<OrderStatus>(dto.Status);
        order.Status = newStatus;

        if (newStatus == OrderStatus.CONFIRMED && order.ConfirmedAt == null)
        {
            order.ConfirmedAt = DateTime.UtcNow;
        }
        else if (newStatus == OrderStatus.DELIVERED && order.DeliveredAt == null)
        {
            order.DeliveredAt = DateTime.UtcNow;
        }

        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetOrderByIdAsync(id) ?? throw new Exception("Failed to update order");
    }

    public async Task<bool> CancelOrderAsync(string id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null || order.Status == OrderStatus.DELIVERED) return false;

        order.Status = OrderStatus.CANCELLED;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    private string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }

    private OrderResponseDto MapToResponse(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            RestaurantId = order.RestaurantId,
            RestaurantName = order.Restaurant.Name,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            CustomerPhone = order.CustomerPhone,
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            Notes = order.Notes,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                MenuItemId = oi.MenuItemId,
                MenuItemName = oi.MenuItem.Name,
                Quantity = oi.Quantity,
                Price = oi.Price,
                Subtotal = oi.Subtotal
            }).ToList(),
            Payment = order.Payment != null ? new PaymentResponseDto
            {
                Id = order.Payment.Id,
                OrderId = order.Payment.OrderId,
                Amount = order.Payment.Amount,
                Method = order.Payment.Method.ToString(),
                Status = order.Payment.Status.ToString(),
                PaypalOrderId = order.Payment.PaypalOrderId,
                CreatedAt = order.Payment.CreatedAt
            } : null,
            CreatedAt = order.CreatedAt
        };
    }
}

