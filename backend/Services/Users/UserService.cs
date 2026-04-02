using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Npgsql.Replication;

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAll()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> GetById(string id)
    {
        return await this.GetById(id);
    }

    public async Task<User> Resgister(string username, string password, string role)
    {
        if(string.IsNullOrWhiteSpace(username))
        {
            throw new Exception("please fill UserName");
        }

        if(string.IsNullOrWhiteSpace(password))
        {
            throw new Exception("please fill password");
        }

        var check = await _context.Users.AnyAsync(name => name.Username == username);

        if(check)
        {
            throw new Exception("Username allready");
        }

        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            PasswordHash = PasswordHasher.Hash(password),
            Role = string.IsNullOrWhiteSpace(role) ? "User" : role,
            CreatedAt = DateTime.UtcNow,
            UpdateTime = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User> Login(string username, string pass)
    {
        if(string.IsNullOrWhiteSpace(username))
        {
            throw new Exception("please fill UserName");
        }

        if(string.IsNullOrWhiteSpace(pass))
        {
            throw new Exception("please fill password");
        }

        var user = await _context.Users.FirstOrDefaultAsync(name => name.Username == username);
        if(user == null)
        {
            return null;
        }
        var password = PasswordHasher.Verify(pass, user.PasswordHash);
        if(!password)
        {
            return null;
        }

        return user;
    }

    public async Task<User> Update(string id,string username, string newpass, string role)
    {
        var user = await _context.Users.FindAsync(id);
        if(user == null)
        {
            throw new Exception("dont have this User");
        }

        if(username != null)
        {
            var existing = await _context.Users.AnyAsync(name => name.Username == username);
            if(existing)
            {
                throw new Exception("Username allready");
            }
        }

        user.Username = username;
        user.PasswordHash = newpass;
        user.Role =role;
        user.UpdateTime = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return user;
    }


    public async Task<Boolean> Delete(string id)
    {
        var user = await _context.Users.FindAsync(id);
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return true;
    }
}