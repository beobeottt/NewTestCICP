public class Register
{
    public string Username {get; set;}
    public string Password {get; set;}

    public string role {get; set;}

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Login
{
    public string Username{get; set;}
    public string Password {get; set;}
}

public class Update
{
    public string Username {get; set;}
    public string Password {get; set;}

    public string role {get; set;}

    public DateTime UpdateTime {get; set;} = DateTime.UtcNow;
}