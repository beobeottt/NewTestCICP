public interface IDocumentService
{
    Task<List<Document>> GetAllAsync();

    Task<Document?> GetByIdAsync(string id);

    Task<Document> CreateAsync (Document document);

    Task<Document?> UpdateAsync(string id, Document document);

    Task<bool> DeleteAsync(string id);
}