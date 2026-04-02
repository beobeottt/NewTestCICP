using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {
        
    }

    public DbSet<Document> Documents {get; set;}

    public DbSet<User> Users
    {
        get;
        set;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Document>()
            .Property(d => d.Role)
            .HasConversion<string>();
    }
}