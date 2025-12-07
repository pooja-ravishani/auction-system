using System.ComponentModel.DataAnnotations;

namespace ElectroBid.Api.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public Role Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Navigation Properties
        public ICollection<Auction>? Auctions { get; set; }
        public ICollection<Bid>? Bids { get; set; }
        public ICollection<Payment>? Payments { get; set; }
    }
}

