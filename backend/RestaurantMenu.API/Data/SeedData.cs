using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Models;
using BCrypt.Net;

namespace RestaurantMenu.API.Data;

public static class SeedData
{
    public static async Task SeedDatabaseAsync(ApplicationDbContext context)
    {
        // Check if already seeded
        if (await context.Users.AnyAsync())
            return;

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

        // Categories for Restaurant 1
        var cat1_1 = new Category
        {
            Name = "Appetizers",
            Description = "Start your meal right",
            Order = 1,
            RestaurantId = restaurant1.Id,
            IsActive = true
        };
        context.Categories.Add(cat1_1);

        var cat1_2 = new Category
        {
            Name = "Pasta",
            Description = "Handmade pasta dishes",
            Order = 2,
            RestaurantId = restaurant1.Id,
            IsActive = true
        };
        context.Categories.Add(cat1_2);

        var cat1_3 = new Category
        {
            Name = "Main Courses",
            Description = "Hearty Italian mains",
            Order = 3,
            RestaurantId = restaurant1.Id,
            IsActive = true
        };
        context.Categories.Add(cat1_3);

        var cat1_4 = new Category
        {
            Name = "Desserts",
            Description = "Sweet endings",
            Order = 4,
            RestaurantId = restaurant1.Id,
            IsActive = true
        };
        context.Categories.Add(cat1_4);

        await context.SaveChangesAsync();

        // Menu Items for Restaurant 1 - Appetizers (10 items)
        var items1_1 = new[]
        {
            new MenuItem { Name = "Bruschetta", Description = "Toasted bread topped with fresh tomatoes, basil, and garlic", Price = 8.99m, Image = "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800", Order = 1, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Caprese Salad", Description = "Fresh mozzarella, tomatoes, and basil drizzled with balsamic", Price = 10.99m, Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", Order = 2, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Antipasto Platter", Description = "Assorted Italian meats, cheeses, and olives", Price = 15.99m, Image = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", Order = 3, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Garlic Bread", Description = "Crispy bread with garlic butter and herbs", Price = 6.99m, Image = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800", Order = 4, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Calamari Fritti", Description = "Crispy fried squid rings with marinara sauce", Price = 12.99m, Image = "https://images.unsplash.com/photo-1562967914-608f82629710?w=800", Order = 5, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Stuffed Mushrooms", Description = "Mushrooms filled with cheese, herbs, and breadcrumbs", Price = 9.99m, Image = "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800", Order = 6, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Prosciutto & Melon", Description = "Thinly sliced prosciutto with fresh cantaloupe", Price = 11.99m, Image = "https://images.unsplash.com/photo-1598515214211-89d3c73c83b8?w=800", Order = 7, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Minestrone Soup", Description = "Traditional vegetable soup with pasta and beans", Price = 7.99m, Image = "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", Order = 8, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Burrata Caprese", Description = "Creamy burrata with cherry tomatoes and pesto", Price = 13.99m, Image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", Order = 9, CategoryId = cat1_1.Id, IsAvailable = true },
            new MenuItem { Name = "Arancini", Description = "Crispy risotto balls filled with mozzarella and peas", Price = 9.99m, Image = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", Order = 10, CategoryId = cat1_1.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items1_1);

        // Menu Items for Restaurant 1 - Pasta (10 items)
        var items1_2 = new[]
        {
            new MenuItem { Name = "Spaghetti Carbonara", Description = "Creamy pasta with bacon, eggs, and parmesan cheese", Price = 16.99m, Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", Order = 1, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Fettuccine Alfredo", Description = "Classic creamy alfredo sauce with parmesan", Price = 15.99m, Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", Order = 2, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Linguine alle Vongole", Description = "Fresh clams in white wine sauce", Price = 19.99m, Image = "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800", Order = 3, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Lasagna", Description = "Layered pasta with meat, cheese, and marinara sauce", Price = 18.99m, Image = "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800", Order = 4, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Penne Arrabbiata", Description = "Spicy tomato sauce with garlic and red peppers", Price = 14.99m, Image = "https://images.unsplash.com/photo-1551462147-85895e3a59f1?w=800", Order = 5, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Ravioli di Ricotta", Description = "Homemade ravioli filled with ricotta and spinach", Price = 17.99m, Image = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800", Order = 6, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Spaghetti Bolognese", Description = "Classic meat sauce with ground beef and tomatoes", Price = 16.99m, Image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", Order = 7, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Gnocchi alla Sorrentina", Description = "Potato gnocchi with tomato sauce and mozzarella", Price = 17.99m, Image = "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800", Order = 8, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Tagliatelle al Ragu", Description = "Fresh tagliatelle with slow-cooked meat sauce", Price = 18.99m, Image = "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800", Order = 9, CategoryId = cat1_2.Id, IsAvailable = true },
            new MenuItem { Name = "Risotto ai Funghi", Description = "Creamy risotto with mixed mushrooms and parmesan", Price = 17.99m, Image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", Order = 10, CategoryId = cat1_2.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items1_2);

        // Menu Items for Restaurant 1 - Main Courses (10 items)
        var items1_3 = new[]
        {
            new MenuItem { Name = "Chicken Parmigiana", Description = "Breaded chicken breast with marinara and mozzarella", Price = 18.99m, Image = "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800", Order = 1, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Veal Marsala", Description = "Tender veal in a rich marsala wine sauce", Price = 24.99m, Image = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800", Order = 2, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Osso Buco", Description = "Braised veal shanks with vegetables and gremolata", Price = 26.99m, Image = "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800", Order = 3, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Grilled Salmon", Description = "Fresh salmon with lemon butter and capers", Price = 22.99m, Image = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800", Order = 4, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Eggplant Parmigiana", Description = "Breaded eggplant layered with marinara and cheese", Price = 16.99m, Image = "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800", Order = 5, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Pork Saltimbocca", Description = "Pork cutlets with prosciutto, sage, and white wine", Price = 20.99m, Image = "https://images.unsplash.com/photo-1558030006-450675393462?w=800", Order = 6, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Beef Brasato", Description = "Slow-braised beef in red wine with vegetables", Price = 25.99m, Image = "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800", Order = 7, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Seafood Risotto", Description = "Creamy risotto with mixed seafood and saffron", Price = 23.99m, Image = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", Order = 8, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Lamb Shank", Description = "Braised lamb shank with rosemary and red wine", Price = 27.99m, Image = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", Order = 9, CategoryId = cat1_3.Id, IsAvailable = true },
            new MenuItem { Name = "Chicken Piccata", Description = "Sautéed chicken with lemon, capers, and white wine", Price = 19.99m, Image = "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800", Order = 10, CategoryId = cat1_3.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items1_3);

        // Menu Items for Restaurant 1 - Desserts (10 items)
        var items1_4 = new[]
        {
            new MenuItem { Name = "Tiramisu", Description = "Classic Italian dessert with coffee and mascarpone", Price = 8.99m, Image = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", Order = 1, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Cannoli", Description = "Crispy shells filled with sweet ricotta", Price = 7.99m, Image = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", Order = 2, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Panna Cotta", Description = "Silky vanilla custard with berry compote", Price = 7.99m, Image = "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800", Order = 3, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Gelato", Description = "Three scoops of house-made gelato", Price = 6.99m, Image = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800", Order = 4, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Chocolate Lava Cake", Description = "Warm chocolate cake with molten center", Price = 9.99m, Image = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800", Order = 5, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Limoncello Cake", Description = "Light lemon cake with limoncello glaze", Price = 8.99m, Image = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800", Order = 6, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Cannoli Siciliani", Description = "Traditional Sicilian cannoli with pistachios", Price = 8.99m, Image = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800", Order = 7, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Zeppole", Description = "Italian donuts dusted with powdered sugar", Price = 6.99m, Image = "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800", Order = 8, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Affogato", Description = "Vanilla gelato with a shot of espresso", Price = 7.99m, Image = "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=800", Order = 9, CategoryId = cat1_4.Id, IsAvailable = true },
            new MenuItem { Name = "Tartufo", Description = "Chocolate and vanilla gelato covered in chocolate", Price = 8.99m, Image = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800", Order = 10, CategoryId = cat1_4.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items1_4);

        // Categories for Restaurant 2
        var cat2_1 = new Category
        {
            Name = "Starters",
            Description = "Begin your journey",
            Order = 1,
            RestaurantId = restaurant2.Id,
            IsActive = true
        };
        context.Categories.Add(cat2_1);

        var cat2_2 = new Category
        {
            Name = "Sushi Rolls",
            Description = "Traditional and creative rolls",
            Order = 2,
            RestaurantId = restaurant2.Id,
            IsActive = true
        };
        context.Categories.Add(cat2_2);

        var cat2_3 = new Category
        {
            Name = "Nigiri",
            Description = "Premium fish on rice",
            Order = 3,
            RestaurantId = restaurant2.Id,
            IsActive = true
        };
        context.Categories.Add(cat2_3);

        var cat2_4 = new Category
        {
            Name = "Sashimi",
            Description = "Fresh sliced fish",
            Order = 4,
            RestaurantId = restaurant2.Id,
            IsActive = true
        };
        context.Categories.Add(cat2_4);

        await context.SaveChangesAsync();

        // Menu Items for Restaurant 2 - Starters (10 items)
        var items2_1 = new[]
        {
            new MenuItem { Name = "Edamame", Description = "Steamed soybeans with sea salt", Price = 5.99m, Image = "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800", Order = 1, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Miso Soup", Description = "Traditional Japanese soup with tofu and seaweed", Price = 4.99m, Image = "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800", Order = 2, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Gyoza", Description = "Pan-fried pork dumplings", Price = 7.99m, Image = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800", Order = 3, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Agedashi Tofu", Description = "Deep-fried tofu in dashi broth", Price = 6.99m, Image = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", Order = 4, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Seaweed Salad", Description = "Fresh seaweed with sesame dressing", Price = 5.99m, Image = "https://images.unsplash.com/photo-1544025162-d76694265947?w=800", Order = 5, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Takoyaki", Description = "Octopus balls with special sauce", Price = 8.99m, Image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", Order = 6, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Chicken Karaage", Description = "Japanese-style fried chicken", Price = 7.99m, Image = "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800", Order = 7, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Shishito Peppers", Description = "Blistered peppers with bonito flakes", Price = 6.99m, Image = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800", Order = 8, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Cucumber Salad", Description = "Fresh cucumbers with ponzu sauce", Price = 4.99m, Image = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800", Order = 9, CategoryId = cat2_1.Id, IsAvailable = true },
            new MenuItem { Name = "Tempura Vegetables", Description = "Lightly battered seasonal vegetables", Price = 8.99m, Image = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800", Order = 10, CategoryId = cat2_1.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items2_1);

        // Menu Items for Restaurant 2 - Sushi Rolls (10 items)
        var items2_2 = new[]
        {
            new MenuItem { Name = "California Roll", Description = "Crab, avocado, and cucumber", Price = 8.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 1, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Dragon Roll", Description = "Eel, cucumber, avocado with eel sauce", Price = 12.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 2, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Spicy Tuna Roll", Description = "Fresh tuna with spicy mayo", Price = 9.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 3, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Salmon Avocado Roll", Description = "Fresh salmon and creamy avocado", Price = 9.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 4, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Caterpillar Roll", Description = "Eel and cucumber topped with avocado", Price = 11.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 5, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Rainbow Roll", Description = "California roll topped with assorted fish", Price = 13.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 6, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Spider Roll", Description = "Soft-shell crab, cucumber, and avocado", Price = 12.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 7, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Philadelphia Roll", Description = "Smoked salmon, cream cheese, and cucumber", Price = 9.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 8, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Volcano Roll", Description = "Spicy tuna and crab with spicy sauce", Price = 11.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 9, CategoryId = cat2_2.Id, IsAvailable = true },
            new MenuItem { Name = "Crispy Rice Roll", Description = "Spicy tuna on crispy rice", Price = 10.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 10, CategoryId = cat2_2.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items2_2);

        // Menu Items for Restaurant 2 - Nigiri (10 items)
        var items2_3 = new[]
        {
            new MenuItem { Name = "Salmon Nigiri", Description = "Fresh Atlantic salmon", Price = 5.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 1, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Tuna Nigiri", Description = "Premium bluefin tuna", Price = 6.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 2, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Eel Nigiri", Description = "Grilled eel with sweet sauce", Price = 6.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 3, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Yellowtail Nigiri", Description = "Fresh yellowtail hamachi", Price = 6.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 4, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Shrimp Nigiri", Description = "Sweet cooked shrimp", Price = 4.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 5, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Squid Nigiri", Description = "Fresh squid with delicate texture", Price = 5.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 6, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Octopus Nigiri", Description = "Tender octopus with wasabi", Price = 5.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 7, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Sea Urchin Nigiri", Description = "Premium uni with rich flavor", Price = 12.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 8, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Scallop Nigiri", Description = "Sweet fresh scallops", Price = 7.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 9, CategoryId = cat2_3.Id, IsAvailable = true },
            new MenuItem { Name = "Mackerel Nigiri", Description = "Rich mackerel with pickled flavor", Price = 5.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 10, CategoryId = cat2_3.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items2_3);

        // Menu Items for Restaurant 2 - Sashimi (10 items)
        var items2_4 = new[]
        {
            new MenuItem { Name = "Sashimi Platter", Description = "Assorted fresh fish (12 pieces)", Price = 24.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 1, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Salmon Sashimi", Description = "Fresh salmon slices (5 pieces)", Price = 12.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 2, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Tuna Sashimi", Description = "Premium tuna slices (5 pieces)", Price = 14.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 3, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Yellowtail Sashimi", Description = "Fresh yellowtail slices (5 pieces)", Price = 13.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 4, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "White Fish Sashimi", Description = "Assorted white fish (5 pieces)", Price = 11.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 5, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Toro Sashimi", Description = "Premium fatty tuna (3 pieces)", Price = 19.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 6, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Scallop Sashimi", Description = "Fresh sweet scallops (4 pieces)", Price = 13.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 7, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Octopus Sashimi", Description = "Tender octopus slices (4 pieces)", Price = 10.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 8, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Sea Urchin Sashimi", Description = "Premium uni (3 pieces)", Price = 16.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 9, CategoryId = cat2_4.Id, IsAvailable = true },
            new MenuItem { Name = "Mixed Sashimi Deluxe", Description = "Chef's selection of premium fish (15 pieces)", Price = 32.99m, Image = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800", Order = 10, CategoryId = cat2_4.Id, IsAvailable = true },
        };
        context.MenuItems.AddRange(items2_4);

        await context.SaveChangesAsync();
    }
}

