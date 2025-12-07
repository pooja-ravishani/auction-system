using ElectroBid.Api.DTOs.Auction;
using ElectroBid.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectroBid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly IAuctionService _auctionService;
        private readonly ILogger<AuctionsController> _logger;

        public AuctionsController(IAuctionService auctionService, ILogger<AuctionsController> logger)
        {
            _auctionService = auctionService;
            _logger = logger;
        }

        // ✅ CREATE AUCTION (supports image upload)
        /// <summary>
        /// Create a new auction (only for Sellers or Admins)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Seller,Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateAuctionDto dto)
        {
            var sellerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            try
            {
                var sellerId = Guid.Parse(sellerIdClaim);
                var created = await _auctionService.CreateAsync(dto, sellerId);

                _logger.LogInformation("Auction created successfully by seller {SellerId}: {Title}", sellerId, dto.Title);

                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating auction for seller {SellerId}", sellerIdClaim);
                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ GET ALL AUCTIONS
        /// <summary>
        /// Get all available auctions (public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var auctions = await _auctionService.GetAllAsync();
            return Ok(auctions);
        }

        // ✅ GET AUCTION BY ID
        /// <summary>
        /// Get details for a specific auction by its ID
        /// </summary>
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var auction = await _auctionService.GetByIdAsync(id);
            if (auction == null)
                return NotFound(new { message = "Auction not found." });

            return Ok(auction);
        }

        // ✅ GET CURRENT SELLER’S AUCTIONS
        /// <summary>
        /// Get all auctions created by the currently logged-in Seller
        /// </summary>
        [HttpGet("mine")]
        [Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> GetMyAuctions()
        {
            var sellerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var sellerId = Guid.Parse(sellerIdClaim);
            var myAuctions = await _auctionService.GetBySellerAsync(sellerId);

            return Ok(myAuctions);
        }

        // ✅ DELETE AUCTION (Seller/Admin only)
        /// <summary>
        /// Delete one of your own auctions (Sellers) or any auction (Admin)
        /// </summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var sellerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerIdClaim))
                return Unauthorized(new { message = "User ID not found in token." });

            var sellerId = Guid.Parse(sellerIdClaim);
            var deleted = await _auctionService.DeleteAsync(id, sellerId);

            if (!deleted)
                return NotFound(new { message = "Auction not found or you don't have permission to delete it." });

            _logger.LogInformation("Auction {AuctionId} deleted by seller {SellerId}", id, sellerId);

            return NoContent();
        }
    }
}
