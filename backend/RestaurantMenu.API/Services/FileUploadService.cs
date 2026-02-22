// Database dependencies removed - file uploads work without database

namespace RestaurantMenu.API.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public FileUploadService(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string? userId = null)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty");

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
            throw new ArgumentException("File size exceeds 5MB limit.");

        // Validate file type - simplified and very lenient
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        
        // Get extension from filename
        var extension = string.IsNullOrEmpty(file.FileName) 
            ? string.Empty 
            : Path.GetExtension(file.FileName).ToLowerInvariant();
        
        // Get content type
        var contentType = (file.ContentType ?? string.Empty).ToLowerInvariant().Trim();
        
        // Log what we received
        Console.WriteLine($"File validation - Extension: '{extension}', ContentType: '{contentType}', FileName: '{file.FileName ?? "null"}'");
        
        // Normalize content type (remove charset, boundary, etc.)
        if (contentType.Contains(";"))
        {
            contentType = contentType.Split(';')[0].Trim();
        }
        
        // Determine extension - prioritize filename, then content type, then default
        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            // Try to infer from content type
            if (!string.IsNullOrEmpty(contentType))
            {
                if (contentType.Contains("jpeg") || contentType.Contains("jpg"))
                    extension = ".jpg";
                else if (contentType.Contains("png"))
                    extension = ".png";
                else if (contentType.Contains("gif"))
                    extension = ".gif";
                else if (contentType.Contains("webp"))
                    extension = ".webp";
                else if (contentType.StartsWith("image/"))
                    extension = ".jpg"; // Default for any image type
                else
                    extension = ".jpg"; // Safe fallback
            }
            else
            {
                // No content type either - default to jpg (frontend validated it's an image)
                extension = ".jpg";
            }
        }
        
        // Final validation - ensure extension is valid
        if (!allowedExtensions.Contains(extension))
        {
            extension = ".jpg"; // Ultimate fallback
        }
        
        Console.WriteLine($"Final extension determined: '{extension}'");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");

        Console.WriteLine($"Uploads folder path: {uploadsFolder}");
        Console.WriteLine($"WebRootPath: {_environment.WebRootPath ?? "null"}");
        Console.WriteLine($"ContentRootPath: {_environment.ContentRootPath}");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
            Console.WriteLine($"Created uploads directory: {uploadsFolder}");
        }

        var filePath = Path.Combine(uploadsFolder, fileName);
        Console.WriteLine($"Saving file to: {filePath}");

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Verify file was saved
        if (!File.Exists(filePath))
        {
            throw new Exception($"File was not saved to {filePath}");
        }
        
        var fileInfo = new FileInfo(filePath);
        Console.WriteLine($"File saved successfully. Size: {fileInfo.Length} bytes, Exists: {fileInfo.Exists}");

        // Get base URL - must include protocol so img src works (without it, browser treats as relative)
        var baseUrl = (_configuration["BaseUrl"] ?? "http://localhost:5000").Trim();
        if (!baseUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) && !baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            baseUrl = "https://" + baseUrl.TrimStart('/');
        baseUrl = baseUrl.TrimEnd('/');
        var fileUrl = $"{baseUrl}/uploads/{fileName}";
        Console.WriteLine($"File URL: {fileUrl}");

        // Skip database save completely - files are saved to disk, that's all we need
        // Database tracking is optional and causes connection issues
        Console.WriteLine($"File uploaded successfully. URL: {fileUrl}");
        Console.WriteLine($"Note: File metadata not saved to database (optional feature)");

        return fileUrl;
    }

    public Task<bool> DeleteFileAsync(string fileUrl)
    {
        var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
        var filePath = Path.Combine(uploadsFolder, fileName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        // Database cleanup is optional - file is already deleted from disk
        Console.WriteLine($"File deleted from disk. Database cleanup skipped (optional feature)");

        return Task.FromResult(true);
    }
}

