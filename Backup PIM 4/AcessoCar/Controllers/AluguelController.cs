using AcessoCar.Dtos.Alugueis;
using AcessoCar.Services.Alugueis;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class AluguelController : ControllerBase
{
    private readonly IAluguelService _aluguelService;

    public AluguelController(IAluguelService AluguelService)
    {

        _aluguelService = AluguelService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<AluguelRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<AluguelRespostaDTO> alugueis = await
            _aluguelService.Listar();

        return Ok(alugueis);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AluguelRespostaDTO>> BuscarPorId(int id)
    {
        AluguelRespostaDTO? aluguel = 
        await _aluguelService.BuscarPorId(id);
        if (aluguel == null)
        {
            return NotFound(new
            {
                mensagem = $"Aluguel com ID {id} não encontrado."
            });
        }


        return Ok(aluguel);
        //return Ok(new { mensagem = $"Controller executado com ID {id}" });
    }
    [HttpPost]
    public async Task<ActionResult<AluguelRespostaDTO>> Criar(CriarAluguelDTO dto)
    {
        AluguelRespostaDTO? aluguelCriado =
        await _aluguelService.Criar(dto);
        if(aluguelCriado == null)
        {
            return NotFound();
        }
        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = aluguelCriado.ID },
        aluguelCriado);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AluguelRespostaDTO>> Atualizar(int id, AtualizarAluguelDTO dto)
    {
        AluguelRespostaDTO? aluguelAtualizada =
        await _aluguelService.Atualizar(id, dto);

        if (aluguelAtualizada == null)
        {
            return NotFound(new { mensagem = "Aluguel não encontrado" });
        }



        return Ok(aluguelAtualizada);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, AtualizarAluguelDTO dto)
    {
        AluguelRespostaDTO? aluguelExcluida = 
        await _aluguelService.Excluir(id, dto);

        if (aluguelExcluida == null)
        {
            return NotFound(new {mensagem = "Aluguel não encontrado"});
        }

        return Ok(aluguelExcluida);
    }

}