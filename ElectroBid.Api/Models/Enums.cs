namespace ElectroBid.Api.Models
{
    // 👤 User roles in the system
    public enum Role
    {
        Admin,
        Seller,
        Buyer
    }

    // 🏷️ Auction status tracking
    public enum AuctionStatus
    {
        Active,
        Completed,
        Cancelled
    }

    // 💳 Payment status states
    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed
    }
}

