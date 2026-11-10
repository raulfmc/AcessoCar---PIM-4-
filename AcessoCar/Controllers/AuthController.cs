using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using AcessoCar.DTOs.Auth;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthDTO dto)
    {
        if (dto.Usuario != "Admin" || dto.Senha != "123")
        {
            return Unauthorized(new
            {
                mensagem = "Usuário ou senha incorretos."
            });
        }

        await HttpContext.SignInAsync(
        "Cookies",
        new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "Admin") }, "Cookies")));
        return Ok(new { mensagem = "Login realizado com sucesso." });
    }
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync("Cookies");

        return Ok(new { mensagem = "Logout realizado com sucesso." });
    }




}