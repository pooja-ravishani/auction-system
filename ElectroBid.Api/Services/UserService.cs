using ElectroBid.Api.Data;
using ElectroBid.Api.DTOs.Auth;
using ElectroBid.Api.DTOs.User;
using ElectroBid.Api.Helpers;
using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCryptNet = BCrypt.Net.BCrypt;

namespace ElectroBid.Api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;
        private readonly JwtSettings _jwt;

        public UserService(ApplicationDbContext db, IOptions<JwtSettings> jwtOptions)
        {
            _db = db;
            _jwt = jwtOptions.Value;
        }

        // --------------------------------------------------
        // ✅ REGISTER USER
        // --------------------------------------------------
        public async Task<UserDto> RegisterAsync(RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Email and password are required.");

            var email = dto.Email.Trim().ToLower();
            var exists = await _db.Users.AnyAsync(u => u.Email == email);
            if (exists)
                throw new ApplicationException("Email already registered.");

            if (!Enum.TryParse(dto.Role, true, out Role parsedRole))
                parsedRole = Role.Buyer;

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                Role = parsedRole,
                PasswordHash = BCryptNet.HashPassword(dto.Password)
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        // --------------------------------------------------
        // ✅ LOGIN USER + GENERATE JWT TOKEN
        // --------------------------------------------------
        public async Task<(string Token, User User)?> LoginAsync(LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return null;

            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());
            if (user == null || !BCryptNet.Verify(dto.Password, user.PasswordHash))
                return null;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return (jwt, user);
        }

        // --------------------------------------------------
        // ✅ GET USER BY ID
        // --------------------------------------------------
        public async Task<UserDto?> GetByIdAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return null;

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }

        // --------------------------------------------------
        // ✅ GET ALL USERS
        // --------------------------------------------------
        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            return await _db.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }
    }
}
