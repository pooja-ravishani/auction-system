using ElectroBid.Api.Data;
using ElectroBid.Api.DTOs.Bid;
using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ElectroBid.Api.Services
{
    public class BidService : IBidService
    {
        private readonly ApplicationDbContext _db;

        public BidService(ApplicationDbContext db)
        {
            _db = db;
        }

        // -------------------------------------------------------------
        // ✅ PLACE A NEW BID
        // -------------------------------------------------------------
        public async Task<BidDto> CreateAsync(CreateBidDto dto, Guid bidderId)
        {
            // 🔍 Validate auction
            var auction = await _db.Auctions.FirstOrDefaultAsync(a => a.Id == dto.AuctionId);
            if (auction == null)
                throw new ApplicationException("Auction not found.");

            // ⏳ Check if auction is still active
            if (DateTime.UtcNow > auction.EndDate)
                throw new ApplicationException("This auction has already ended.");

            // 💰 Ensure bid is higher than current price or starting price
            var minBid = auction.CurrentPrice > 0 ? auction.CurrentPrice : auction.StartingPrice;
            if (dto.Amount <= minBid)
                throw new ApplicationException($"Your bid must be higher than Rs. {minBid:N2}");

            // 🚫 Prevent seller from bidding on their own auction
            if (auction.SellerId == bidderId)
                throw new ApplicationException("You cannot bid on your own auction.");

            // 📝 Create new bid entry
            var bid = new Bid
            {
                AuctionId = dto.AuctionId,
                BidderId = bidderId,
                Amount = dto.Amount
            };

            _db.Bids.Add(bid);

            // 🧮 Update auction’s current price
            auction.CurrentPrice = dto.Amount;
            _db.Auctions.Update(auction);

            await _db.SaveChangesAsync();

            var bidder = await _db.Users.FindAsync(bidderId);

            // ✅ Return DTO
            return new BidDto
            {
                Id = bid.Id,
                AuctionId = bid.AuctionId,
                BidderId = bid.BidderId,
                BidderName = bidder?.FullName ?? "Unknown",
                Amount = bid.Amount,
                PlacedAt = bid.PlacedAt
            };
        }

        // -------------------------------------------------------------
        // ✅ GET ALL BIDS FOR A SPECIFIC AUCTION
        // -------------------------------------------------------------
        public async Task<IEnumerable<BidDto>> GetByAuctionAsync(Guid auctionId)
        {
            // 🧩 Generate payment for winner if auction ended
            await GeneratePaymentForWinnerAsync(auctionId);

            return await _db.Bids
                .Where(b => b.AuctionId == auctionId)
                .Include(b => b.Bidder)
                .OrderByDescending(b => b.PlacedAt)
                .Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionId = b.AuctionId,
                    BidderId = b.BidderId,
                    BidderName = b.Bidder.FullName,
                    Amount = b.Amount,
                    PlacedAt = b.PlacedAt
                })
                .ToListAsync();
        }

        // -------------------------------------------------------------
        // ✅ GET ALL BIDS MADE BY A SPECIFIC BUYER
        // -------------------------------------------------------------
        public async Task<IEnumerable<BidDto>> GetByBidderAsync(Guid bidderId)
        {
            return await _db.Bids
                .Where(b => b.BidderId == bidderId)
                .Include(b => b.Auction)
                .OrderByDescending(b => b.PlacedAt)
                .Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionId = b.AuctionId,
                    BidderId = b.BidderId,
                    BidderName = b.Bidder.FullName,
                    Amount = b.Amount,
                    PlacedAt = b.PlacedAt
                })
                .ToListAsync();
        }

        // -------------------------------------------------------------
        // 🏆 AUTO-CREATE PAYMENT FOR WINNER
        // -------------------------------------------------------------
        private async Task GeneratePaymentForWinnerAsync(Guid auctionId)
        {
            var auction = await _db.Auctions
                .Include(a => a.Seller)
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null || auction.Bids.Count == 0)
                return;

            // ✅ Only trigger when auction has ended
            if (DateTime.UtcNow < auction.EndDate)
                return;

            // 🏆 Get highest bid
            var topBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
            if (topBid == null)
                return;

            // 💳 Check if payment already exists for this auction
            bool paymentExists = await _db.Payments
                .AnyAsync(p => p.AuctionId == auctionId && p.UserId == topBid.BidderId);
            if (paymentExists)
                return;

            // 🧾 Create payment record
            var payment = new Payment
            {
                AuctionId = auctionId,
                UserId = topBid.BidderId,
                Amount = topBid.Amount,
                Status = PaymentStatus.Pending,
                PaidAt = null
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();
        }
    }
}
