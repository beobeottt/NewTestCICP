using Microsoft.AspNetCore.Http;

public class DocumentCreateWithFileRequest
{
    public string title { get; set; } = string.Empty;
    public string description { get; set; } = string.Empty;
    public string content { get; set; } = string.Empty;
    public DocumentRole Role { get; set; } = DocumentRole.Pending;
    public string CreateBy { get; set; } = string.Empty;

    public IFormFile? File { get; set; }
}

public class UpdateDocumentReq
{
    public string? title { get; set; }
    public string? description { get; set; }
    public string? content { get; set; }
    public DocumentRole? Role { get; set; }
    public string? CreateBy { get; set; }
    public IFormFile? File { get; set; }
}


public class DocumentCreate
{
        public string title { get; set; } = string.Empty;
    public string description { get; set; } = string.Empty;
    public string content { get; set; } = string.Empty;
    public DocumentRole Role { get; set; } = DocumentRole.Pending;
    public string CreateBy { get; set; } = string.Empty;
}

