using AcessoCar.Dtos.Manutencoes;
using AcessoCar.Services.Manutencoes;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class ManutencaoController : ControllerBase
{
    private readonly IManutencaoService _manutencaoService;

    public ManutencaoController(IManutencaoService ManutencaoService)
    {

        _manutencaoService = ManutencaoService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ManutencaoRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<ManutencaoRespostaDTO> manutencoes = await
            _manutencaoService.Listar();

        return Ok(manutencoes);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ManutencaoRespostaDTO>> BuscarPorId(int id)
    {
        ManutencaoRespostaDTO? manutencao = await
            _manutencaoService.BuscarPorId(id);
        if (manutencao == null)
        {
            return NotFound(new
            {
                mensagem = $"Manutencao com ID {id} não encontrada."
            });
        }


        return Ok(manutencao);
    }
    [HttpPost]
    public async Task<ActionResult<ManutencaoRespostaDTO>> Criar(CriarManutencaoDTO dto)
    {
        ManutencaoRespostaDTO? manutencaoCriada =
        await _manutencaoService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = manutencaoCriada!.ID },
        manutencaoCriada);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ManutencaoRespostaDTO>> Atualizar(int id, AtualizarManutencaoDTO dto)
    {
        ManutencaoRespostaDTO? manutencaoAtualizada =
        await _manutencaoService.Atualizar(id, dto);

        if (manutencaoAtualizada == null)
        {
            return NotFound(new { mensagem = "Manutenção não encontrada" });
        }



        return Ok(manutencaoAtualizada);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, AtualizarManutencaoDTO dto)
    {
        ManutencaoRespostaDTO? manutencaoExcluida = 
        await _manutencaoService.Excluir(id, dto);

        if (manutencaoExcluida == null)
        {
            return NotFound(new {mensagem = "Manutenção não encontrada"});
        }

        return Ok(manutencaoExcluida);
    }

}