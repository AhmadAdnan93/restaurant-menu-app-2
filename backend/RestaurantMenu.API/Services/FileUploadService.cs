using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;

namespace RestaurantMenu.API.Services;

public class FileUploadService : IFileUploadService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public FileUploadService(
        ApplicationDbContext context,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string? userId = null)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            throw new ArgumentException("Invalid file type. Only images are allowed.");

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
            throw new ArgumentException("File size exceeds 5MB limit.");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var filePath = Path.Combine(uploadsFolder, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Get base URL (should be configured in appsettings)
        var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:5000";
        var fileUrl = $"{baseUrl}/uploads/{fileName}";

        // Save to database
        var fileUpload = new FileUpload
        {
            FileName = fileName,
            OriginalName = file.FileName,
            MimeType = file.ContentType,
            Size = file.Length,
            Url = fileUrl,
            UploadedBy = userId
        };

        _context.FileUploads.Add(fileUpload);
        await _context.SaveChangesAsync();

        return fileUrl;
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
        var filePath = Path.Combine(uploadsFolder, fileName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        var fileUpload = await _context.FileUploads.FirstOrDefaultAsync(f => f.Url == fileUrl);
        if (fileUpload != null)
        {
            _context.FileUploads.Remove(fileUpload);
            await _context.SaveChangesAsync();
        }

        return true;
    }
}

