public interface IUserService
{
    Task<List<User>> GetAllAsync();
    Task<User?> GetByIdAsync(string id);
    Task<User> RegisterAsync(string username, string PasswordHash, string? role = null);
    Task<User?> LoginAsync(string username, string PasswordHash);
    Task<User?> UpdateAsync(string id, string? username = null, string? role = null, string? newPasswordHash = null);
    Task<bool> DeleteAsync(string id);
}

