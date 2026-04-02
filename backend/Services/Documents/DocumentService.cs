using Microsoft.EntityFrameworkCore;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _context;

    public DocumentService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<List<Document>> GetAllAsync()
    {
        return await _context.Documents.ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(string id)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);
    }


    public async Task<Document> CreateAsync(Document document)
    {
        if (string.IsNullOrEmpty(document.Id))
        {
            document.Id = Guid.NewGuid().ToString();
        }

        document.CreateAt = DateTime.UtcNow;
        document.UpdateAt = DateTime.UtcNow;

        _context.Documents.Add(document);

        await _context.SaveChangesAsync();

        return document;
    }

    public async Task<Document?> UpdateAsync(string id, Document updatedDocument)
{
   
    var existingDocument = await _context.Documents
        .FirstOrDefaultAsync(d => d.Id == id);

    if (existingDocument == null)
    {
        return null;
    }
    _context.Entry(existingDocument).CurrentValues.SetValues(updatedDocument);
    existingDocument.Id = id;
    existingDocument.UpdateAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return existingDocument;
}

    public async Task<bool> DeleteAsync(string id)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return false;
        }

        _context.Documents.Remove(document);

        await _context.SaveChangesAsync();

        return true;
    }
}