using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]

public class UserController : ControllerBase
{
    private readonly UserService userService;

    private readonly JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService)
    {
    this.userService = userService;
    this.jwtService = jwtService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await userService.GetAll();

        return users;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> FindOne(string id)
    {
        var user = await userService.GetById(id);

        return Ok(user);
    }

    [HttpPost("Regitser")]
    public async Task<IActionResult> Regitser([FromBody] Register req)
    {
        try
        {
            var user = await userService.Resgister(req.Username, req.Password, req.role);
            return Ok(user);
        }
        catch(Exception ex)
        {
            return BadRequest("Can not Register");
        }
    }

    [HttpPost("Login")]

    public async Task<IActionResult> login([FromBody] Login req)
    {
        var user = await userService.Login(req.Username,req.Password);

        if(user == null)
        {
            return Unauthorized(new {message = "PasswordHash, username not true"});
        }

        var token = jwtService.GenerateToken(
            user.Id.ToString(),
            user.Username,
            user.Role
        );

        return Ok(new
        {
            token = token,
            user
        });
    }

    [HttpPut("{id}")]

    public async Task<IActionResult> Update(string id, [FromBody] Update req)
    {
        try
        {
            var user = await userService.Update(id, req.Username, req.Password, req.role);
            return Ok(user);
        }
        catch(Exception ex)
        {
            return BadRequest(new {message = ex.Message});
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var delete = await userService.Delete(id);
        return NoContent();
    }

}