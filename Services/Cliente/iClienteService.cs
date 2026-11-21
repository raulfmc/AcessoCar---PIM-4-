using AcessoCar.Dtos.Clientes;

namespace AcessoCar.Services.Clientes;

public interface IClienteService
{
    Task<IReadOnlyCollection<ClienteRespostaDTO>> Listar();
    Task<ClienteRespostaDTO?> BuscarPorId(int ID);
    Task<ClienteRespostaDTO?> Criar(CriarClienteDTO dto);
    Task<ClienteRespostaDTO?> Atualizar(int id, AtualizarClienteDTO dto);

    Task<string> CalcularEstado(int id);
    Task<ClienteRespostaDTO?> Excluir(int id);
    
}