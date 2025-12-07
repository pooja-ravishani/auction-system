using ElectroBid.Api.Models;

namespace ElectroBid.Api.DTOs.Payment
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid AuctionId { get; set; }
        public decimal Amount { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime? PaidAt { get; set; } // ✅ Nullable to match model
    }

    public class CreatePaymentDto
    {
        public Guid AuctionId { get; set; }
        public decimal Amount { get; set; }
    }
}
