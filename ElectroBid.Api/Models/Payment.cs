using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectroBid.Api.Models
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // 🔗 Relationships
        [Required]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        public Guid AuctionId { get; set; }

        [ForeignKey(nameof(AuctionId))]
        public Auction Auction { get; set; } = null!;

        // 💰 Payment Details
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
        [Column(TypeName = "decimal(18,2)")] // ✅ Added precision to fix truncation warnings
        public decimal Amount { get; set; }

        // 🧾 Payment Status
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        // 🕒 Payment timestamp (nullable until paid)
        public DateTime? PaidAt { get; set; }
    }
}
