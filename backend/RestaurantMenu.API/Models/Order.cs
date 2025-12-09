namespace RestaurantMenu.API.Models;

public enum OrderStatus
{
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    DELIVERED,
    CANCELLED
}

public enum PaymentStatus
{
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED
}

public enum PaymentMethod
{
    PAYPAL,
    CASH,
    CARD
}

public class Order
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderNumber { get; set; } = string.Empty;
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    public string? UserId { get; set; }
    public User? User { get; set; }
    
    // Customer Info
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    
    // Order Details
    public OrderStatus Status { get; set; } = OrderStatus.PENDING;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    // Navigation Properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

public class OrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
    public string MenuItemId { get; set; } = string.Empty;
    public MenuItem MenuItem { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Subtotal { get; set; }
}

public class Payment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderId { get; set; } = string.Empty;
    public Order Order { get; set; } = null!;
    public string? UserId { get; set; }
    public User? User { get; set; }
    
    // Payment Details
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;
    
    // PayPal Integration
    public string? PaypalOrderId { get; set; }
    public string? PaypalTransactionId { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

public class FileUpload
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FileName { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

