using System.ComponentModel.DataAnnotations;

public class User
{
    [Key]
    public string Id {get; set;}

    [Required]
    [MaxLength(200)]
    public string Username {get; set;}

    [Required]
    [MinLength(6)]
    public string PasswordHash{get; set;}

    [Required]
    public string Role {get; set;}

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdateTime {get; set;} = DateTime.UtcNow;
}