using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Models;
using BCrypt.Net;

namespace RestaurantMenu.API.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            return; // Database already seeded
        }

        // Create Super Admin
        var superAdmin = new User
        {
            Email = "admin@restaurantmenu.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Super",
            LastName = "Admin",
            Role = UserRole.SUPER_ADMIN,
            Status = UserStatus.ACTIVE,
            EmailVerified = true
        };
        context.Users.Add(superAdmin);

        // Create Restaurant Owner 1
        var owner1 = new User
        {
            Email = "mario@marioskitchen.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Mario@123"),
            FirstName = "Mario",
            LastName = "Rossi",
            Role = UserRole.RESTAURANT_OWNER,
            Status = UserStatus.ACTIVE,
            EmailVerified = true
        };
        context.Users.Add(owner1);

        // Create Restaurant Owner 2
        var owner2 = new User
        {
            Email = "chef@tokyosushi.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Tokyo@123"),
            FirstName = "Hiroshi",
            LastName = "Tanaka",
            Role = UserRole.RESTAURANT_OWNER,
            Status = UserStatus.ACTIVE,
            EmailVerified = true
        };
        context.Users.Add(owner2);

        await context.SaveChangesAsync();

        // Restaurant 1: Mario's Italian Kitchen
        var restaurant1 = new Restaurant
        {
            Name = "Mario's Italian Kitchen",
            Slug = "marios-italian-kitchen",
            Description = "Authentic Italian cuisine with traditional recipes passed down through generations.",
            Logo = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
            CoverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
            Phone = "+1-555-0101",
            Email = "info@marioskitchen.com",
            Address = "123 Main Street",
            City = "New York",
            Country = "USA",
            Status = RestaurantStatus.ACTIVE,
            IsPublished = true
        };
        context.Restaurants.Add(restaurant1);

        // Restaurant 2: Tokyo Sushi Bar
        var restaurant2 = new Restaurant
        {
            Name = "Tokyo Sushi Bar",
            Slug = "tokyo-sushi-bar",
            Description = "Fresh sushi and Japanese cuisine made with premium ingredients.",
            Logo = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
            CoverImage = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200",
            Phone = "+1-555-0202",
            Email = "info@tokyosushi.com",
            Address = "456 Sushi Avenue",
            City = "Los Angeles",
            Country = "USA",
            Status = RestaurantStatus.ACTIVE,
            IsPublished = true
        };
        context.Restaurants.Add(restaurant2);

        await context.SaveChangesAsync();

        // Assign Owners
        var owner1Relation = new RestaurantOwner
        {
            UserId = owner1.Id,
            RestaurantId = restaurant1.Id
        };
        context.RestaurantOwners.Add(owner1Relation);

        var owner2Relation = new RestaurantOwner
        {
            UserId = owner2.Id,
            RestaurantId = restaurant2.Id
        };
        context.RestaurantOwners.Add(owner2Relation);

        await context.SaveChangesAsync();

        // Categories and Menu Items for Restaurant 1
        var category1 = new Category
        {
            Name = "Appetizers",
            Description = "Start your meal right",
            Order = 1,
            RestaurantId = restaurant1.Id
        };
        context.Categories.Add(category1);

        var category2 = new Category
        {
            Name = "Pasta",
            Description = "Handmade pasta dishes",
            Order = 2,
            RestaurantId = restaurant1.Id
        };
        context.Categories.Add(category2);

        await context.SaveChangesAsync();

        // Menu Items for Restaurant 1
        context.MenuItems.AddRange(new[]
        {
            new MenuItem
            {
                Name = "Bruschetta",
                Description = "Toasted bread topped with fresh tomatoes, basil, and garlic",
                Price = 8.99m,
                Image = "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800",
                Order = 1,
                CategoryId = category1.Id
            },
            new MenuItem
            {
                Name = "Caprese Salad",
                Description = "Fresh mozzarella, tomatoes, and basil drizzled with balsamic",
                Price = 10.99m,
                Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
                Order = 2,
                CategoryId = category1.Id
            },
            new MenuItem
            {
                Name = "Spaghetti Carbonara",
                Description = "Creamy pasta with bacon, eggs, and parmesan cheese",
                Price = 16.99m,
                Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
                Order = 1,
                CategoryId = category2.Id
            },
            new MenuItem
            {
                Name = "Fettuccine Alfredo",
                Description = "Classic creamy alfredo sauce with parmesan",
                Price = 15.99m,
                Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
                Order = 2,
                CategoryId = category2.Id
            }
        });

        // Categories and Menu Items for Restaurant 2
        var category3 = new Category
        {
            Name = "Sushi Rolls",
            Description = "Traditional and creative rolls",
            Order = 1,
            RestaurantId = restaurant2.Id
        };
        context.Categories.Add(category3);

        var category4 = new Category
        {
            Name = "Nigiri",
            Description = "Premium fish on rice",
            Order = 2,
            RestaurantId = restaurant2.Id
        };
        context.Categories.Add(category4);

        await context.SaveChangesAsync();

        context.MenuItems.AddRange(new[]
        {
            new MenuItem
            {
                Name = "California Roll",
                Description = "Crab, avocado, and cucumber",
                Price = 8.99m,
                Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
                Order = 1,
                CategoryId = category3.Id
            },
            new MenuItem
            {
                Name = "Dragon Roll",
                Description = "Eel, cucumber, avocado with eel sauce",
                Price = 12.99m,
                Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
                Order = 2,
                CategoryId = category3.Id
            },
            new MenuItem
            {
                Name = "Salmon Nigiri",
                Description = "Fresh Atlantic salmon",
                Price = 5.99m,
                Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
                Order = 1,
                CategoryId = category4.Id
            },
            new MenuItem
            {
                Name = "Tuna Nigiri",
                Description = "Premium bluefin tuna",
                Price = 6.99m,
                Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
                Order = 2,
                CategoryId = category4.Id
            }
        });

        await context.SaveChangesAsync();
    }
}

