using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectroBid.Api.Models
{
    public class Auction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal StartingPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentPrice { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🏷️ Extra Product Info
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Voltage { get; set; }
        public string? Power { get; set; }
        public string? Warranty { get; set; }
        public string? ImageUrl { get; set; }

        // 🔗 Relationships
        [Required]
        public Guid SellerId { get; set; }

        [ForeignKey(nameof(SellerId))]
        public User Seller { get; set; } = null!;

        // ✅ New: Collection of Bids for this Auction
        public ICollection<Bid> Bids { get; set; } = new List<Bid>();

        // (Optional) If you want payments linked directly
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
