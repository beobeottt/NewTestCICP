using Microsoft.EntityFrameworkCore;

public static class DbSchemaPatcher
{
    public static async Task PatchAsync(AppDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync(
            "ALTER TABLE \"Documents\" ADD COLUMN IF NOT EXISTS \"AttachmentFileName\" text;"
        );
        await db.Database.ExecuteSqlRawAsync(
            "ALTER TABLE \"Documents\" ADD COLUMN IF NOT EXISTS \"AttachmentUrl\" text;"
        );
    }
}

