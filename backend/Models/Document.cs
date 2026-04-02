public class Document
{
    public string Id { get; set;} = string.Empty;

    public string title { get; set;} = string.Empty;

    public string description {get; set;} = string.Empty;

    public string content {get; set;} = string.Empty;

    public DocumentRole Role { get; set; } = DocumentRole.Pending;

    public string? AttachmentFileName { get; set; }

    public string? AttachmentUrl { get; set; }

    public string CreateBy {get; set;} = string.Empty;

    public DateTime CreateAt {get; set;} = DateTime.UtcNow;

    public DateTime UpdateAt {get; set;} = DateTime.UtcNow;

    public DateTime RecieveAt {get; set;} = DateTime.UtcNow;
}