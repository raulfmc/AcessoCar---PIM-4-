using AcessoCar.Dtos.Dividas;
using AcessoCar.Services.Dividas;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class DividaController : ControllerBase
{
    private readonly IDividaService _dividaService;

    public DividaController(IDividaService DividaService)
    {

        _dividaService = DividaService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<DividaRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<DividaRespostaDTO> dividas = await
            _dividaService.Listar();

        return Ok(dividas);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<DividaRespostaDTO>> BuscarPorId(int id)
    {
        DividaRespostaDTO? divida = await
            _dividaService.BuscarPorId(id);
        if (divida == null)
        {
            return NotFound(new
            {
                mensagem = $"Divida com ID {id} não encontrado."
            });
        }


        return Ok(divida);
    }
    [HttpPost]
    public async Task<ActionResult<DividaRespostaDTO>> Criar(CriarDividaDTO dto)
    {
        DividaRespostaDTO? dividaCriada =
        await _dividaService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = dividaCriada!.ID },
        dividaCriada);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DividaRespostaDTO>> Atualizar(int id, AtualizarDividaDTO dto)
    {
        DividaRespostaDTO? dividaAtualizada =
        await _dividaService.Atualizar(id, dto);

        if (dividaAtualizada == null)
        {
            return NotFound(new { mensagem = "Dívida não encontrada" });
        }



        return Ok(dividaAtualizada);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, AtualizarDividaDTO dto)
    {
        DividaRespostaDTO? dividaExcluida = 
        await _dividaService.Excluir(id, dto);

        if (dividaExcluida == null)
        {
            return NotFound(new {mensagem = "Dívida não encontrada"});
        }

        return Ok(dividaExcluida);
    }

}