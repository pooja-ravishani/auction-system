using ElectroBid.Api.DTOs.User;
using ElectroBid.Api.DTOs.Auth;
using ElectroBid.Api.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ElectroBid.Api.Services
{
    public interface IUserService
    {
        Task<UserDto> RegisterAsync(RegisterDto dto);

        // ✅ Return both token and user (for frontend)
        Task<(string Token, User User)?> LoginAsync(LoginDto dto);

        Task<UserDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<UserDto>> GetAllAsync();
    }
}
