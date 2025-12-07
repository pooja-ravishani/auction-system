using ElectroBid.Api.DTOs.Bid;

namespace ElectroBid.Api.Services
{
    public interface IBidService
    {
        Task<BidDto> CreateAsync(CreateBidDto dto, Guid bidderId);
        Task<IEnumerable<BidDto>> GetByAuctionAsync(Guid auctionId);
        Task<IEnumerable<BidDto>> GetByBidderAsync(Guid bidderId);
    }
}
