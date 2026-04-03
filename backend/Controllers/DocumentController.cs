using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly CloudinaryService _cloudinaryService;

    public DocumentController(
        IDocumentService documentService,
        CloudinaryService cloudinaryService
        )
    {
        _documentService = documentService;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var documents = await _documentService.GetAllAsync();
        return Ok(documents);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var document = await _documentService.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
        }

        return Ok(document);
    }

    [HttpPost("with-file")]
public async Task<IActionResult> CreateWithFile([FromForm] DocumentCreateWithFileRequest req)
{
    try
    {
        var document = new Document
        {
            title = req.title,
            description = req.description,
            content = req.content,
            Role = req.Role,
            CreateBy = req.CreateBy
        };

        if (req.File is { Length: > 0 })
        {
            var url = await _cloudinaryService.UploadAsync(req.File);

            document.AttachmentUrl = url;
            document.AttachmentFileName = req.File.FileName;
        }

        var created = await _documentService.CreateAsync(document);

        return Ok(created);
    }
    catch (Exception ex)
    {
        Console.WriteLine("ERROR: " + ex.Message);
        return BadRequest(new { error = ex.Message });
    }
}

[HttpPatch("{id}")]
public async Task<IActionResult> Patch(string id, [FromForm] UpdateDocumentReq req)
{
    Console.WriteLine("===== PATCH DEBUG =====");
    Console.WriteLine($"ID: {id}");
    Console.WriteLine($"Title: {req.title}");
    Console.WriteLine($"Description: {req.description}");
    Console.WriteLine($"Content: {req.content}");
    Console.WriteLine($"Role: {req.Role}");
    Console.WriteLine($"CreateBy: {req.CreateBy}");
    Console.WriteLine($"Has File: {req.File != null}");

    var document = await _documentService.GetByIdAsync(id);

    if (document == null)
    {
        Console.WriteLine("Document NOT FOUND");
        return NotFound();
    }
    if (!string.IsNullOrEmpty(req.title))
        document.title = req.title;

    if (!string.IsNullOrEmpty(req.description))
        document.description = req.description;

    if (!string.IsNullOrEmpty(req.content))
        document.content = req.content;

    if (req.Role != null)
        document.Role = req.Role.Value;

    if (!string.IsNullOrEmpty(req.CreateBy))
        document.CreateBy = req.CreateBy;

    // Upload file nếu có
    if (req.File is { Length: > 0 })
    {
        var url = await _cloudinaryService.UploadAsync(req.File);
        document.AttachmentUrl = url;
        document.AttachmentFileName = req.File.FileName;

        Console.WriteLine("File uploaded!");
    }

    var updated = await _documentService.UpdateAsync(id, document);

    Console.WriteLine("UPDATE SUCCESS");

    return Ok(updated);
}

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _documentService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();

    }


}