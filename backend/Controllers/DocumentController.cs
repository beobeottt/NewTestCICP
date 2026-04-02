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

    [HttpPut("{id}")]
public async Task<IActionResult> Update(string id, [FromForm] UpdateDocumentReq req)
{
    var document = await _documentService.GetByIdAsync(id);

    if (document == null) return NotFound();

    document.title = req.title;
    document.description = req.description;
    document.content = req.content;
    document.Role = req.Role;
    document.CreateBy = req.CreateBy;

    if (req.File is { Length: > 0 })
    {
        var url = await _cloudinaryService.UploadAsync(req.File);
        document.AttachmentUrl = url;
        document.AttachmentFileName = req.File.FileName;
    }

    var updated = await _documentService.UpdateAsync(id, document);

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