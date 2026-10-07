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
        AdaptacaoRespostaDTO? adaptacaoCriada =
        await _adaptacaoService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = adaptacaoCriada!.ID },
        adaptacaoCriada);

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
    public async Task<IActionResult> Excluir(int id, AtualizarAdaptacaoDTO dto)
    {
        AdaptacaoRespostaDTO? adaptacaoExcluida = 
        await _adaptacaoService.Excluir(id, dto);

        if (adaptacaoExcluida == null)
        {
            return NotFound(new {mensagem = "Adaptação não encontrada"});
        }

        return Ok(adaptacaoExcluida);
    }

}