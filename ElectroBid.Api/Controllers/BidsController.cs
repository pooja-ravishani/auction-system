using ElectroBid.Api.DTOs.Bid;
using ElectroBid.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectroBid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidsController : ControllerBase
    {
        private readonly IBidService _bidService;
        private readonly ILogger<BidsController> _logger;

        public BidsController(IBidService bidService, ILogger<BidsController> logger)
        {
            _bidService = bidService;
            _logger = logger;
        }

        // -------------------------------------------------------------
        // ✅ CREATE A NEW BID (Buyer/Admin only)
        // -------------------------------------------------------------
        [HttpPost]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateBidDto dto)
        {
            var bidderIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(bidderIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            try
            {
                var bidderId = Guid.Parse(bidderIdClaim);
                var bid = await _bidService.CreateAsync(dto, bidderId);

                _logger.LogInformation("✅ Bid placed successfully by user {UserId} on auction {AuctionId}",
                    bidderId, dto.AuctionId);

                return Ok(bid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error placing bid by user {UserId} on auction {AuctionId}",
                    bidderIdClaim, dto.AuctionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // -------------------------------------------------------------
        // ✅ GET BIDS FOR A SPECIFIC AUCTION (public)
        // -------------------------------------------------------------
        [HttpGet("auction/{auctionId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByAuction(Guid auctionId)
        {
            var bids = await _bidService.GetByAuctionAsync(auctionId);
            return Ok(bids);
        }

        // -------------------------------------------------------------
        // ✅ GET CURRENT BUYER’S BIDS (Buyer/Admin only)
        // -------------------------------------------------------------
        [HttpGet("my")]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> GetMyBids()
        {
            var bidderIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(bidderIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            try
            {
                var bidderId = Guid.Parse(bidderIdClaim);
                var bids = await _bidService.GetByBidderAsync(bidderId);

                _logger.LogInformation("📦 Retrieved {Count} bids for user {UserId}",
                    bids?.Count() ?? 0, bidderId);

                return Ok(bids);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error fetching bids for user {UserId}", bidderIdClaim);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
