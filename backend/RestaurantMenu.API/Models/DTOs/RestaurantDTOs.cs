namespace RestaurantMenu.API.Models.DTOs;

public class RestaurantCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? CoverImage { get; set; }
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}

public class RestaurantUpdateDto
{
    public string? Name { get; set; }
    public string? Logo { get; set; }
    public string? CoverImage { get; set; }
    public string? Description { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? Status { get; set; }
    public bool? IsPublished { get; set; }
}

public class RestaurantResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Logo { get; set; }
    public string? CoverImage { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string QrCode { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public int CategoryCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RestaurantDetailDto : RestaurantResponseDto
{
    public List<CategoryResponseDto> Categories { get; set; } = new();
}

public class CategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; } = 0;
}

public class CategoryUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? Order { get; set; }
    public bool? IsActive { get; set; }
}

public class CategoryResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Order { get; set; }
    public bool IsActive { get; set; }
    public int MenuItemCount { get; set; }
    public List<MenuItemResponseDto> MenuItems { get; set; } = new();
}

public class MenuItemCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Image { get; set; }
    public int Order { get; set; } = 0;
}

public class MenuItemUpdateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? Image { get; set; }
    public int? Order { get; set; }
    public bool? IsAvailable { get; set; }
}

public class MenuItemResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Image { get; set; }
    public int Order { get; set; }
    public bool IsAvailable { get; set; }
    public double AverageRating { get; set; }
    public int RatingCount { get; set; }
}

