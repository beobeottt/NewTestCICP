using System.Security.Cryptography;

public static class PasswordHasher
{
    // Format: pbkdf2$<iters>$<saltB64>$<hashB64>
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 100_000;

    public static string Hash(string Password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            KeySize
        );

        return $"pbkdf2${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string Password, string PasswordHash)
    {
        if (string.IsNullOrWhiteSpace(PasswordHash)) return false;
        var parts = PasswordHash.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 4) return false;
        if (!string.Equals(parts[0], "pbkdf2", StringComparison.Ordinal)) return false;
        if (!int.TryParse(parts[1], out var iters)) return false;

        byte[] salt;
        byte[] expected;
        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expected = Convert.FromBase64String(parts[3]);
        }
        catch
        {
            return false;
        }

        var actual = Rfc2898DeriveBytes.Pbkdf2(
            Password,
            salt,
            iters,
            HashAlgorithmName.SHA256,
            expected.Length
        );

        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}

