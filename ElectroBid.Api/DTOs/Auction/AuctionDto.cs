using Microsoft.AspNetCore.Http;

namespace ElectroBid.Api.DTOs.Auction
{
    // ✅ DTO used for responses
    public class AuctionDto
    {
        public Guid Id { get; set; }

        // --- Basic Info ---
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // --- Pricing ---
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }

        // --- Product Details ---
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Voltage { get; set; }
        public string? Power { get; set; }
        public string? Warranty { get; set; }

        // --- Media ---
        public string? ImageUrl { get; set; }

        // --- Timestamps ---
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }

        // --- Seller Info ---
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
    }

    // ✅ DTO used for creating new auctions
    public class CreateAuctionDto
    {
        // --- Basic Info ---
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // --- Pricing ---
        public decimal StartingPrice { get; set; }

        // --- Product Details ---
        public string Category { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Voltage { get; set; }
        public string? Power { get; set; }
        public string? Warranty { get; set; }

        // --- Media ---
        public IFormFile? Image { get; set; }

        // --- Auction Duration ---
        public DateTime EndDate { get; set; }
    }
}
