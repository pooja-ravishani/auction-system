using ElectroBid.Api.Data;
using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ElectroBid.Api.Services
{
    public class AuctionBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuctionBackgroundService> _logger;

        public AuctionBackgroundService(IServiceScopeFactory scopeFactory, ILogger<AuctionBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🏁 Auction background service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    // 🔍 Find all ended auctions that don’t have payments yet
                    var endedAuctions = await db.Auctions
                        .Where(a => a.EndDate < DateTime.UtcNow)
                        .ToListAsync(stoppingToken);

                    foreach (var auction in endedAuctions)
                    {
                        bool hasPayment = await db.Payments.AnyAsync(p => p.AuctionId == auction.Id, stoppingToken);
                        if (hasPayment) continue;

                        var highestBid = await db.Bids
                            .Where(b => b.AuctionId == auction.Id)
                            .OrderByDescending(b => b.Amount)
                            .FirstOrDefaultAsync(stoppingToken);

                        if (highestBid != null)
                        {
                            var payment = new Payment
                            {
                                AuctionId = auction.Id,
                                UserId = highestBid.BidderId,
                                Amount = highestBid.Amount,
                                Status = PaymentStatus.Pending,
                                PaidAt = null
                            };

                            db.Payments.Add(payment);
                            await db.SaveChangesAsync(stoppingToken);

                            _logger.LogInformation($"💳 Payment created for auction '{auction.Title}' — Winner: {highestBid.BidderId}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error running auction background service");
                }

                // ⏳ Check every 60 seconds
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("🛑 Auction background service stopped.");
        }
    }
}
