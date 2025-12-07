using ElectroBid.Api.Data;
using ElectroBid.Api.DTOs.Payment;
using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ElectroBid.Api.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _db;

        public PaymentService(ApplicationDbContext db)
        {
            _db = db;
        }

        // ✅ Create payment record
        public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto, Guid buyerId)
        {
            var payment = new Payment
            {
                AuctionId = dto.AuctionId,
                UserId = buyerId,
                Amount = dto.Amount,
                Status = PaymentStatus.Pending, // 🕓 Initially pending
                PaidAt = null
            };

            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            return MapToDto(payment);
        }

        // ✅ Mark payment as completed (Pay Now)
        public async Task<bool> MarkAsPaidAsync(Guid paymentId, Guid buyerId)
        {
            var payment = await _db.Payments
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == buyerId);

            if (payment == null)
                return false;

            if (payment.Status == PaymentStatus.Completed)
                throw new ApplicationException("This payment has already been completed.");

            payment.Status = PaymentStatus.Completed;
            payment.PaidAt = DateTime.UtcNow;

            _db.Payments.Update(payment);
            await _db.SaveChangesAsync();

            return true;
        }

        // ✅ Admin: Get all payments
        public async Task<IEnumerable<PaymentDto>> GetAllAsync()
        {
            var payments = await _db.Payments.ToListAsync();
            return payments.Select(MapToDto);
        }

        // ✅ Get payment by ID
        public async Task<PaymentDto?> GetByIdAsync(Guid id)
        {
            var payment = await _db.Payments.FindAsync(id);
            return payment == null ? null : MapToDto(payment);
        }

        // ✅ Get payments by Buyer
        public async Task<IEnumerable<PaymentDto>> GetByBuyerAsync(Guid buyerId)
        {
            var payments = await _db.Payments
                .Where(p => p.UserId == buyerId)
                .ToListAsync();

            return payments.Select(MapToDto);
        }

        // ✅ Get payments by Auction
        public async Task<IEnumerable<PaymentDto>> GetByAuctionAsync(Guid auctionId)
        {
            var payments = await _db.Payments
                .Where(p => p.AuctionId == auctionId)
                .ToListAsync();

            return payments.Select(MapToDto);
        }

        // 🧩 Helper: Map Payment → PaymentDto
        private static PaymentDto MapToDto(Payment p)
        {
            return new PaymentDto
            {
                Id = p.Id,
                UserId = p.UserId,
                AuctionId = p.AuctionId,
                Amount = p.Amount,
                Status = p.Status,
                PaidAt = p.PaidAt // ✅ Nullable-safe now
            };
        }
    }
}
