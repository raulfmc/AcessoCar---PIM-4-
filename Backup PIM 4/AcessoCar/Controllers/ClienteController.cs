
using AcessoCar.Dtos.Clientes;
using AcessoCar.Services.Clientes;
using Microsoft.AspNetCore.Mvc;
namespace AcessoCar.Controllers;



[ApiController]
[Route("api/[controller]")]
public class ClienteController : ControllerBase
{
    private readonly IClienteService _ClienteService;

    public ClienteController(IClienteService clienteService)
    {

        _ClienteService = clienteService;

    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ClienteRespostaDTO>>> Listar()
    {
        IReadOnlyCollection<ClienteRespostaDTO> clientes = await
            _ClienteService.Listar();

        return Ok(clientes);


    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteRespostaDTO>> BuscarPorId(int id)
    {
        ClienteRespostaDTO? cliente = await
            _ClienteService.BuscarPorId(id);
        if (cliente == null || cliente.Ativo == false)
        {
            return NotFound(new
            {
                mensagem = $"Cliente com ID {id} não encontrado."
            });
        }


        return Ok(cliente);
    }
    [HttpPost]
    public async Task<ActionResult<ClienteRespostaDTO>> Criar(CriarClienteDTO dto)
    {
        ClienteRespostaDTO? clienteCriado =
        await _ClienteService.Criar(dto);

        return CreatedAtAction(
        nameof(BuscarPorId),
        new {id = clienteCriado!.ID },
        clienteCriado);

    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClienteRespostaDTO>> Atualizar(int id, AtualizarClienteDTO dto)
    {
        ClienteRespostaDTO? clienteAtualizado =
        await _ClienteService.Atualizar(id, dto);

        if (clienteAtualizado == null)
        {
            return NotFound(new { mensagem = "Cliente não encontrado" });
        }



        return Ok(clienteAtualizado);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Excluir(int id, AtualizarClienteDTO dto)
    {
        ClienteRespostaDTO? clienteExcluido = 
        await _ClienteService.Excluir(id, dto);

        if (clienteExcluido == null)
        {
            return NotFound(new {mensagem = "Cliente não encontrado"});
        }

        return Ok(clienteExcluido);
    }

}