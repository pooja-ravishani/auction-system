using ElectroBid.Api.DTOs.Auction;

namespace ElectroBid.Api.Services
{
    public interface IAuctionService
    {
        // ✅ Create new auction (with image + product details)
        Task<AuctionDto> CreateAsync(CreateAuctionDto dto, Guid sellerId);

        // ✅ Get all auctions (public view)
        Task<IEnumerable<AuctionDto>> GetAllAsync();

        // ✅ Get single auction by ID
        Task<AuctionDto?> GetByIdAsync(Guid id);

        // ✅ Get all auctions by a specific seller
        Task<IEnumerable<AuctionDto>> GetBySellerAsync(Guid sellerId);

        // ✅ Optional: Delete or Close auction (future extension)
        Task<bool> DeleteAsync(Guid id, Guid sellerId);
    }
}
