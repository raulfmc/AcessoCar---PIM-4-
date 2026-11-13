using AcessoCar.Dtos.Parcelas;
using AcessoCar.Services.Parcelas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;


[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ParcelaController : ControllerBase
{
    private readonly IParcelaService _ParcelaService;

    public ParcelaController(IParcelaService ParcelaService)
    {

        _ParcelaService = ParcelaService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ParcelaRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<ParcelaRespostaDTO> manutencoes = await
            _ParcelaService.Listar();

        return Ok(manutencoes);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ParcelaRespostaDTO>> BuscarPorId(int id)
    {
        ParcelaRespostaDTO? Parcela = await
            _ParcelaService.BuscarPorId(id);
        if (Parcela == null)
        {
            return NotFound(new
            {
                mensagem = $"Parcela com ID {id} não encontrada."
            });
        }


        return Ok(Parcela);
    }
    [HttpPost]
    public async Task<ActionResult<ParcelaRespostaDTO>> Criar(CriarParcelaDTO dto)
    {
        ParcelaRespostaDTO? ParcelaCriada =
        await _ParcelaService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = ParcelaCriada!.ID },
        ParcelaCriada);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ParcelaRespostaDTO>> Atualizar(int id, AtualizarParcelaDTO dto)
    {
        ParcelaRespostaDTO? ParcelaAtualizada =
        await _ParcelaService.Atualizar(id, dto);

        if (ParcelaAtualizada == null)
        {
            return NotFound(new { mensagem = "Manutenção não encontrada" });
        }



        return Ok(ParcelaAtualizada);
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        ParcelaRespostaDTO? ParcelaExcluida = 
        await _ParcelaService.Excluir(id);

        if (ParcelaExcluida == null)
        {
            return NotFound(new {mensagem = "Manutenção não encontrada"});
        }

        return NoContent();
    }

}