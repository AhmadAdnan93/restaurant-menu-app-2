using RestaurantMenu.API.Models.DTOs;

namespace RestaurantMenu.API.Services;

public interface IPaymentService
{
    Task<PaymentResponseDto> CreatePaymentAsync(PaymentCreateDto dto, string? userId = null);
    Task<string> CreatePayPalOrderAsync(PayPalCreateOrderDto dto);
    Task<PaymentResponseDto> CapturePayPalOrderAsync(PayPalCaptureOrderDto dto);
    Task<PaymentResponseDto?> GetPaymentByIdAsync(string id);
    Task<PaymentResponseDto?> GetPaymentByOrderIdAsync(string orderId);
}

