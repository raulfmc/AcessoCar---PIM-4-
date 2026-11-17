



using AcessoCar.Dtos.Financeiro;
using AcessoCar.Services.Financeiro;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AcessoCar.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FinanceiroController : ControllerBase
{
    
    private readonly IFinanceiroService _FinanceiroService;

    public FinanceiroController(IFinanceiroService FinanceiroService)
    {
        _FinanceiroService = FinanceiroService;
    }
    [HttpGet]
    public async Task<ActionResult<List<FinanceiroDTO>>> ObterDados()
    {
        List<FinanceiroDTO> dados = await
            _FinanceiroService.ObterDados();

        return Ok(dados);
    }


    
}