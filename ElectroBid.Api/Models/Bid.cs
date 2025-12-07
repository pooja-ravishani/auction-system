using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectroBid.Api.Models
{
    public class Bid
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Bid amount must be greater than zero.")]
        [Column(TypeName = "decimal(18,2)")] // ✅ Added precision to prevent truncation warnings
        public decimal Amount { get; set; }

        public DateTime PlacedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Relationships
        [Required]
        public Guid AuctionId { get; set; }

        [ForeignKey(nameof(AuctionId))]
        public Auction Auction { get; set; } = null!;

        [Required]
        public Guid BidderId { get; set; }

        [ForeignKey(nameof(BidderId))]
        public User Bidder { get; set; } = null!;
    }
}
