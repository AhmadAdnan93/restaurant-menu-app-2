using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Models;

namespace RestaurantMenu.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Authentication & Users
    public DbSet<User> Users { get; set; }
    public DbSet<RestaurantOwner> RestaurantOwners { get; set; }

    // Restaurants
    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Rating> Ratings { get; set; }

    // Orders & Payments
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }

    // File Uploads
    public DbSet<FileUpload> FileUploads { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Restaurant Configuration
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.QrCode).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(255);
        });

        // Category Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasOne(c => c.Restaurant)
                  .WithMany(r => r.Categories)
                  .HasForeignKey(c => c.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // MenuItem Configuration
        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasOne(m => m.Category)
                  .WithMany(c => c.MenuItems)
                  .HasForeignKey(m => m.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(m => m.Price)
                  .HasPrecision(10, 2);
        });

        // Order Configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.TotalAmount)
                  .HasPrecision(10, 2);
            
            entity.HasOne(o => o.Restaurant)
                  .WithMany(r => r.Orders)
                  .HasForeignKey(o => o.RestaurantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem Configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(oi => oi.Price).HasPrecision(10, 2);
            entity.Property(oi => oi.Subtotal).HasPrecision(10, 2);
        });

        // Payment Configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(e => e.PaypalOrderId).IsUnique();
            entity.Property(e => e.Amount)
                  .HasPrecision(10, 2);
            
            entity.HasOne(p => p.Order)
                  .WithOne(o => o.Payment)
                  .HasForeignKey<Payment>(p => p.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // RestaurantOwner Configuration
        modelBuilder.Entity<RestaurantOwner>(entity =>
        {
            entity.HasIndex(ro => ro.UserId).IsUnique();
            entity.HasIndex(ro => ro.RestaurantId).IsUnique();
        });
    }
}

