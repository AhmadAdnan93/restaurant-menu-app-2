using Microsoft.EntityFrameworkCore;
using RestaurantMenu.API.Data;
using RestaurantMenu.API.Models;
using RestaurantMenu.API.Models.DTOs;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalHttp;

namespace RestaurantMenu.API.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PayPalEnvironment _paypalEnvironment;

    public PaymentService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;

        var clientId = _configuration["PayPal:ClientId"];
        var clientSecret = _configuration["PayPal:ClientSecret"];
        var mode = _configuration["PayPal:Mode"] ?? "sandbox";

        _paypalEnvironment = mode == "sandbox"
            ? new SandboxEnvironment(clientId, clientSecret)
            : new LiveEnvironment(clientId, clientSecret);
    }

    public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentCreateDto dto, string? userId = null)
    {
        var order = await _context.Orders
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

        if (order == null) throw new KeyNotFoundException("Order not found");
        if (order.Payment != null) throw new InvalidOperationException("Payment already exists");

        var payment = new Payment
        {
            OrderId = dto.OrderId,
            UserId = userId,
            Amount = order.TotalAmount,
            Method = Enum.Parse<PaymentMethod>(dto.Method.ToUpper()),
            Status = PaymentStatus.PENDING
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return MapToResponse(payment);
    }

    public async Task<string> CreatePayPalOrderAsync(PayPalCreateOrderDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

        if (order == null) throw new KeyNotFoundException("Order not found");

        // Create or get payment
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == dto.OrderId);
        if (payment == null)
        {
            payment = new Payment
            {
                OrderId = dto.OrderId,
                Amount = order.TotalAmount,
                Method = PaymentMethod.PAYPAL,
                Status = PaymentStatus.PENDING
            };
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
        }

        // Create PayPal Order
        var client = new PayPalHttpClient(_paypalEnvironment);

        var paypalOrder = new OrderRequest
        {
            CheckoutPaymentIntent = "CAPTURE",
            ApplicationContext = new ApplicationContext
            {
                BrandName = order.Restaurant.Name,
                LandingPage = "BILLING",
                UserAction = "PAY_NOW",
                ReturnUrl = $"{_configuration["Frontend:BaseUrl"]}/payment/success",
                CancelUrl = $"{_configuration["Frontend:BaseUrl"]}/payment/cancel"
            },
            PurchaseUnits = new List<PurchaseUnitRequest>
            {
                new PurchaseUnitRequest
                {
                    ReferenceId = order.OrderNumber,
                    Description = $"Order {order.OrderNumber}",
                    AmountWithBreakdown = new AmountWithBreakdown
                    {
                        CurrencyCode = "USD",
                        Value = order.TotalAmount.ToString("F2"),
                        AmountBreakdown = new AmountBreakdown
                        {
                            ItemTotal = new Money
                            {
                                CurrencyCode = "USD",
                                Value = order.TotalAmount.ToString("F2")
                            }
                        }
                    },
                    Items = order.OrderItems.Select(oi => new Item
                    {
                        Name = oi.MenuItem.Name,
                        Description = oi.MenuItem.Description,
                        UnitAmount = new Money
                        {
                            CurrencyCode = "USD",
                            Value = oi.Price.ToString("F2")
                        },
                        Quantity = oi.Quantity.ToString()
                    }).ToList()
                }
            }
        };

        var request = new OrdersCreateRequest();
        request.Prefer("return=representation");
        request.RequestBody(paypalOrder);

        var response = await client.Execute(request);
        var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

        // Update payment with PayPal order ID
        payment.PaypalOrderId = result.Id;
        await _context.SaveChangesAsync();

        // Return approval URL
        var approvalLink = result.Links.FirstOrDefault(l => l.Rel == "approve");
        return approvalLink?.Href ?? throw new Exception("Failed to get PayPal approval URL");
    }

    public async Task<PaymentResponseDto> CapturePayPalOrderAsync(PayPalCaptureOrderDto dto)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == dto.OrderId && p.PaypalOrderId == dto.PayPalOrderId);

        if (payment == null) throw new KeyNotFoundException("Payment not found");

        var client = new PayPalHttpClient(_paypalEnvironment);
        var request = new OrdersCaptureRequest(dto.PayPalOrderId);
        request.Prefer("return=representation");
        request.RequestBody(new OrderActionRequest());

        var response = await client.Execute(request);
        var result = response.Result<PayPalCheckoutSdk.Orders.Order>();

        if (result.Status == "COMPLETED")
        {
            payment.Status = PaymentStatus.COMPLETED;
            payment.PaypalTransactionId = result.PurchaseUnits[0].Payments.Captures[0].Id;
            payment.CompletedAt = DateTime.UtcNow;

            // Update order status
            payment.Order.Status = OrderStatus.CONFIRMED;
            payment.Order.ConfirmedAt = DateTime.UtcNow;
        }
        else
        {
            payment.Status = PaymentStatus.FAILED;
        }

        await _context.SaveChangesAsync();
        return MapToResponse(payment);
    }

    public async Task<PaymentResponseDto?> GetPaymentByIdAsync(string id)
    {
        var payment = await _context.Payments.FindAsync(id);
        return payment == null ? null : MapToResponse(payment);
    }

    public async Task<PaymentResponseDto?> GetPaymentByOrderIdAsync(string orderId)
    {
        var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
        return payment == null ? null : MapToResponse(payment);
    }

    private PaymentResponseDto MapToResponse(Payment payment)
    {
        return new PaymentResponseDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Amount = payment.Amount,
            Method = payment.Method.ToString(),
            Status = payment.Status.ToString(),
            PaypalOrderId = payment.PaypalOrderId,
            CreatedAt = payment.CreatedAt
        };
    }
}

