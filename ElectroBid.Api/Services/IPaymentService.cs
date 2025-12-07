using ElectroBid.Api.DTOs.Payment;

namespace ElectroBid.Api.Services
{
    public interface IPaymentService
    {
        Task<PaymentDto> CreateAsync(CreatePaymentDto dto, Guid buyerId);
        Task<IEnumerable<PaymentDto>> GetAllAsync();
        Task<PaymentDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<PaymentDto>> GetByBuyerAsync(Guid buyerId);
        Task<IEnumerable<PaymentDto>> GetByAuctionAsync(Guid auctionId);

        // ✅ Add this missing method
        Task<bool> MarkAsPaidAsync(Guid paymentId, Guid buyerId);
    }
}
