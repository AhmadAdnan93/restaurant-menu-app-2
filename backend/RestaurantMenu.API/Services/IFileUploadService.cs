namespace RestaurantMenu.API.Services;

public interface IFileUploadService
{
    Task<string> UploadImageAsync(IFormFile file, string? userId = null);
    Task<bool> DeleteFileAsync(string fileUrl);
}

