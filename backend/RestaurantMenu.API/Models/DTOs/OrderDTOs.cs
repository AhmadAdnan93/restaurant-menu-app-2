namespace RestaurantMenu.API.Models.DTOs;

public class OrderCreateDto
{
    public string RestaurantId { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemCreateDto> Items { get; set; } = new();
}

public class OrderItemCreateDto
{
    public string MenuItemId { get; set; } = string.Empty;
    public int Quantity { get; set; }
}

public class OrderResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
    public PaymentResponseDto? Payment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OrderItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string MenuItemId { get; set; } = string.Empty;
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Subtotal { get; set; }
}

public class OrderUpdateStatusDto
{
    public string Status { get; set; } = string.Empty; // PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED
}

public class PaymentCreateDto
{
    public string OrderId { get; set; } = string.Empty;
    public string Method { get; set; } = "PAYPAL"; // PAYPAL, CASH, CARD
}

public class PaymentResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? PaypalOrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PayPalCreateOrderDto
{
    public string OrderId { get; set; } = string.Empty;
}

public class PayPalCaptureOrderDto
{
    public string OrderId { get; set; } = string.Empty;
    public string PayPalOrderId { get; set; } = string.Empty;
}

