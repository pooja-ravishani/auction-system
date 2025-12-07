using ElectroBid.Api.Models;
using Microsoft.EntityFrameworkCore;
using BCryptNet = BCrypt.Net.BCrypt;

namespace ElectroBid.Api.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAdminAsync(ApplicationDbContext db)
        {
            // Apply pending migrations automatically (optional but useful for first run)
            if (db.Database.GetPendingMigrations().Any())
            {
                Console.WriteLine("⚙️ Applying pending migrations...");
                await db.Database.MigrateAsync();
            }

            // Seed default admin if none exists
            if (!await db.Users.AnyAsync(u => u.Role == Role.Admin))
            {
                var admin = new User
                {
                    FullName = "System Admin",
                    Email = "admin@electrobid.com",
                    PasswordHash = BCryptNet.HashPassword("Admin@123"),
                    Role = Role.Admin
                };

                db.Users.Add(admin);
                await db.SaveChangesAsync();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✅ Admin user seeded successfully:");
                Console.WriteLine("   Email: admin@electrobid.com");
                Console.WriteLine("   Password: Admin@123");
                Console.ResetColor();
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("ℹ️ Admin user already exists — skipping seeding.");
                Console.ResetColor();
            }
        }
    }
}
