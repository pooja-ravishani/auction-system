using ElectroBid.Api.DTOs.Payment;
using ElectroBid.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectroBid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        // ✅ Create a new payment (Admin or Buyer)
        [HttpPost]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            var buyerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerIdClaim))
                return Unauthorized();

            var buyerId = Guid.Parse(buyerIdClaim);
            var payment = await _paymentService.CreateAsync(dto, buyerId);

            _logger.LogInformation("💳 Payment created by Buyer {BuyerId} for Auction {AuctionId}", buyerId, dto.AuctionId);

            return Ok(payment);
        }

        // ✅ Admin: View all payments
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetAllAsync();
            return Ok(payments);
        }

        // ✅ Get payment by ID (Buyer or Admin)
        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var payment = await _paymentService.GetByIdAsync(id);
            if (payment == null)
                return NotFound(new { message = "Payment not found." });

            return Ok(payment);
        }

        // ✅ Get my payments (Buyer or Admin)
        [HttpGet("my")]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> GetMyPayments()
        {
            var buyerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerIdClaim))
                return Unauthorized();

            var buyerId = Guid.Parse(buyerIdClaim);
            var payments = await _paymentService.GetByBuyerAsync(buyerId);

            return Ok(payments);
        }

        // ✅ Complete a payment (simulate pay now)
        [HttpPost("pay/{id:guid}")]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> Pay(Guid id)
        {
            var buyerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(buyerIdClaim))
                return Unauthorized();

            var buyerId = Guid.Parse(buyerIdClaim);

            try
            {
                var success = await _paymentService.MarkAsPaidAsync(id, buyerId);
                if (!success)
                    return NotFound(new { message = "Payment not found or not authorized." });

                _logger.LogInformation("✅ Payment {PaymentId} completed by Buyer {BuyerId}", id, buyerId);
                return Ok(new { message = "Payment completed successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error completing payment {PaymentId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
