

using AcessoCar.Dtos.Dashboard;
using AcessoCar.Services.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AcessoCar.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _DashboardService;

    public DashboardController(IDashboardService DashboardService)
    {
        _DashboardService = DashboardService;
    }
    [HttpGet]
    public async Task<ActionResult<DashboardDTO>> ObterDados()
    {
        DashboardDTO dados = await
            _DashboardService.ObterDados();

        return Ok(dados);
    }

}