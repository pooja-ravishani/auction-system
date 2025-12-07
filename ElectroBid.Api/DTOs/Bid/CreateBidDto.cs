namespace ElectroBid.Api.DTOs.Bid
{
    public class CreateBidDto
    {
        public Guid AuctionId { get; set; }
        public decimal Amount { get; set; }
    }
}
