
using AcessoCar.Dtos.Carros;
using AcessoCar.Services.Carros;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class CarroController : ControllerBase
{
    private readonly ICarroService _CarroService;

    public CarroController(ICarroService CarroService)
    {

        _CarroService = CarroService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<CarroRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<CarroRespostaDTO> Carros = await
            _CarroService.Listar();

        return Ok(Carros);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CarroRespostaDTO>> BuscarPorId(int id)
    {
        CarroRespostaDTO? Carro = await
            _CarroService.BuscarPorId(id);
        if (Carro == null || Carro.Ativo == false)
        {
            return NotFound(new
            {
                mensagem = $"Carro com ID {id} não encontrado."
            });
        }


        return Ok(Carro);
    }
    [HttpPost]
    public async Task<ActionResult<CarroRespostaDTO>> Criar(CriarCarroDTO dto)
    {
        CarroRespostaDTO? carroCriado =
        await _CarroService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = carroCriado!.ID },
        carroCriado);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CarroRespostaDTO>> Atualizar(int id, AtualizarCarroDTO dto)
    {
        CarroRespostaDTO? carroAtualizado =
        await _CarroService.Atualizar(id, dto);

        if (carroAtualizado == null)
        {
            return NotFound(new { mensagem = "Carro não encontrado" });
        }



        return Ok(carroAtualizado);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, AtualizarCarroDTO dto)
    {
        CarroRespostaDTO? carroExcluido = 
        await _CarroService.Excluir(id, dto);

        if (carroExcluido == null)
        {
            return NotFound(new {mensagem = "Carro não encontrado"});
        }

        return Ok(carroExcluido);
    }

}
//Desenho mostrando a arquitetura do sistema 
//Checklist na documentação do PIM