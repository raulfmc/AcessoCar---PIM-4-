using AcessoCar.Dtos;
using AcessoCar.Dtos.Adaptacoes;
using AcessoCar.Services.Adaptacoes;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class AdaptacaoController : ControllerBase
{
    private readonly IAdaptacaoService _adaptacaoService;

    public AdaptacaoController(IAdaptacaoService adaptacaoService)
    {

        _adaptacaoService = adaptacaoService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<AdaptacaoRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<AdaptacaoRespostaDTO> adaptacoes = await
            _adaptacaoService.Listar();

        return Ok(adaptacoes);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AdaptacaoRespostaDTO>> BuscarPorId(int id)
    {
        AdaptacaoRespostaDTO? adaptacao = await
            _adaptacaoService.BuscarPorId(id);
        if (adaptacao == null)
        {
            return NotFound(new
            {
                mensagem = $"Adaptacao com ID {id} não encontrado."
            });
        }


        return Ok(adaptacao);
    }
    [HttpPost]
    public async Task<ActionResult<AdaptacaoRespostaDTO>> Criar(CriarAdaptacaoDTO dto)
    {
        try
        {
            AdaptacaoRespostaDTO? adaptacaoCriada =
            await _adaptacaoService.Criar(dto);


            if (adaptacaoCriada is null)
            {
                return NotFound(new { message = "Carro não encontrado." });
            }
            return CreatedAtAction(
            nameof(BuscarPorId),
            new { id = adaptacaoCriada.ID },
            adaptacaoCriada);
        }
        catch (ArgumentException ae)
        {
            return BadRequest(new { message = ae.Message});
        }
        catch (KeyNotFoundException ke)
        {
            return NotFound(new { message = ke.Message});
        }
        catch (InvalidOperationException ioe)
        {
            return Conflict(new { message = ioe.Message});
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AdaptacaoRespostaDTO>> Atualizar(int id, AtualizarAdaptacaoDTO dto)
    {
        AdaptacaoRespostaDTO? adaptacaoAtualizada =
        await _adaptacaoService.Atualizar(id, dto);

        if (adaptacaoAtualizada == null)
        {
            return NotFound(new { mensagem = "Adaptação não encontrada" });
        }



        return Ok(adaptacaoAtualizada);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id)
    {
        AdaptacaoRespostaDTO? adaptacaoExcluida =
        await _adaptacaoService.Excluir(id);

        if (adaptacaoExcluida == null)
        {
            return NotFound(new { mensagem = "Adaptação não encontrada" });
        }

        return NoContent();
    }

}