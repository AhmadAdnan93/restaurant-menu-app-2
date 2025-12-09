namespace RestaurantMenu.API.Models;

public enum RestaurantStatus
{
    ACTIVE,
    INACTIVE,
    PENDING,
    SUSPENDED
}

public class Restaurant
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? CoverImage { get; set; }
    public string? Description { get; set; }
    public RestaurantStatus Status { get; set; } = RestaurantStatus.PENDING;
    
    // Contact Information
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    
    // Settings
    public string QrCode { get; set; } = Guid.NewGuid().ToString();
    public bool IsPublished { get; set; } = false;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<RestaurantOwner> Owners { get; set; } = new List<RestaurantOwner>();
}

public class Category
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string RestaurantId { get; set; } = string.Empty;
    public Restaurant Restaurant { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}

public class MenuItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Image { get; set; }
    public int Order { get; set; } = 0;
    public bool IsAvailable { get; set; } = true;
    public string CategoryId { get; set; } = string.Empty;
    public Category Category { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
}

public class Rating
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int Value { get; set; } // 1-5
    public string? Comment { get; set; }
    public string MenuItemId { get; set; } = string.Empty;
    public MenuItem MenuItem { get; set; } = null!;
    public string? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

