using ElectroBid.Api.Data;
using ElectroBid.Api.DTOs.Auction;
using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ElectroBid.Api.Services
{
    public class AuctionService : IAuctionService
    {
        private readonly ApplicationDbContext _db;
        private readonly IWebHostEnvironment _env;

        public AuctionService(ApplicationDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ✅ Create new auction
        public async Task<AuctionDto> CreateAsync(CreateAuctionDto dto, Guid sellerId)
        {
            string? imageUrl = null;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "auctions");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(stream);
                }

                imageUrl = $"/images/auctions/{uniqueFileName}";
            }

            var auction = new Auction
            {
                Title = dto.Title,
                Description = dto.Description,
                StartingPrice = dto.StartingPrice,
                CurrentPrice = dto.StartingPrice,
                EndDate = dto.EndDate,
                SellerId = sellerId,
                Category = dto.Category,
                Condition = dto.Condition,
                Brand = dto.Brand,
                Power = dto.Power,
                Voltage = dto.Voltage,
                Warranty = dto.Warranty,
                ImageUrl = imageUrl
            };

            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();

            var seller = await _db.Users.FindAsync(sellerId);

            return new AuctionDto
            {
                Id = auction.Id,
                Title = auction.Title,
                Description = auction.Description,
                StartingPrice = auction.StartingPrice,
                CurrentPrice = auction.CurrentPrice,
                EndDate = auction.EndDate,
                CreatedAt = auction.CreatedAt,
                SellerId = auction.SellerId,
                SellerName = seller?.FullName ?? "Unknown",
                Category = auction.Category,
                Condition = auction.Condition,
                Brand = auction.Brand,
                Power = auction.Power,
                Voltage = auction.Voltage,
                Warranty = auction.Warranty,
                ImageUrl = auction.ImageUrl
            };
        }

        // ✅ Automatically finalize auction & create payment for winner
        private async Task CheckAndFinalizeAuctionAsync(Guid auctionId)
        {
            var auction = await _db.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
                return;

            // ⏳ Skip if auction still active
            if (auction.EndDate > DateTime.UtcNow)
                return;

            // 🏆 Find highest bidder
            var topBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
            if (topBid == null)
                return; // No bids placed

            // 💳 Check if payment already exists
            var existingPayment = await _db.Payments
                .FirstOrDefaultAsync(p => p.AuctionId == auction.Id && p.UserId == topBid.BidderId);

            if (existingPayment == null)
            {
                var payment = new Payment
                {
                    AuctionId = auction.Id,
                    UserId = topBid.BidderId,
                    Amount = topBid.Amount,
                    Status = PaymentStatus.Pending,
                    PaidAt = null
                };

                _db.Payments.Add(payment);
                await _db.SaveChangesAsync();
            }
        }

        // ✅ Get all auctions
        public async Task<IEnumerable<AuctionDto>> GetAllAsync()
        {
            var auctions = await _db.Auctions
                .Include(a => a.Seller)
                .ToListAsync();

            // Run finalization check for any expired auctions
            foreach (var a in auctions)
                await CheckAndFinalizeAuctionAsync(a.Id);

            return auctions.Select(a => new AuctionDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                StartingPrice = a.StartingPrice,
                CurrentPrice = a.CurrentPrice,
                EndDate = a.EndDate,
                CreatedAt = a.CreatedAt,
                SellerId = a.SellerId,
                SellerName = a.Seller.FullName,
                Category = a.Category,
                Condition = a.Condition,
                Brand = a.Brand,
                Power = a.Power,
                Voltage = a.Voltage,
                Warranty = a.Warranty,
                ImageUrl = a.ImageUrl
            });
        }

        // ✅ Get auction by ID (includes winner payment generation)
        public async Task<AuctionDto?> GetByIdAsync(Guid id)
        {
            await CheckAndFinalizeAuctionAsync(id); // 🏁 Auto-create payment if ended

            var a = await _db.Auctions.Include(a => a.Seller)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (a == null) return null;

            return new AuctionDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                StartingPrice = a.StartingPrice,
                CurrentPrice = a.CurrentPrice,
                EndDate = a.EndDate,
                CreatedAt = a.CreatedAt,
                SellerId = a.SellerId,
                SellerName = a.Seller.FullName,
                Category = a.Category,
                Condition = a.Condition,
                Brand = a.Brand,
                Power = a.Power,
                Voltage = a.Voltage,
                Warranty = a.Warranty,
                ImageUrl = a.ImageUrl
            };
        }

        // ✅ Get all auctions by seller
        public async Task<IEnumerable<AuctionDto>> GetBySellerAsync(Guid sellerId)
        {
            var auctions = await _db.Auctions
                .Where(a => a.SellerId == sellerId)
                .Include(a => a.Seller)
                .ToListAsync();

            foreach (var a in auctions)
                await CheckAndFinalizeAuctionAsync(a.Id);

            return auctions.Select(a => new AuctionDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                StartingPrice = a.StartingPrice,
                CurrentPrice = a.CurrentPrice,
                EndDate = a.EndDate,
                CreatedAt = a.CreatedAt,
                SellerId = a.SellerId,
                SellerName = a.Seller.FullName,
                Category = a.Category,
                Condition = a.Condition,
                Brand = a.Brand,
                Power = a.Power,
                Voltage = a.Voltage,
                Warranty = a.Warranty,
                ImageUrl = a.ImageUrl
            });
        }

        // ✅ Delete auction (only seller)
        public async Task<bool> DeleteAsync(Guid id, Guid sellerId)
        {
            var auction = await _db.Auctions.FirstOrDefaultAsync(a => a.Id == id && a.SellerId == sellerId);
            if (auction == null) return false;

            if (!string.IsNullOrEmpty(auction.ImageUrl))
            {
                var imagePath = Path.Combine(_env.WebRootPath, auction.ImageUrl.TrimStart('/'));
                if (File.Exists(imagePath))
                    File.Delete(imagePath);
            }

            _db.Auctions.Remove(auction);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
