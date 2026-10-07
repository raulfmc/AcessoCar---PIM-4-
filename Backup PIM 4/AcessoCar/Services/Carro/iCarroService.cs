using AcessoCar.Dtos.Carros;

namespace AcessoCar.Services.Carros;

public interface ICarroService
{
    Task<IReadOnlyCollection<CarroRespostaDTO>> Listar();
    Task<CarroRespostaDTO?> BuscarPorId(int ID);
    Task<CarroRespostaDTO?> Criar(CriarCarroDTO dto);
    Task<CarroRespostaDTO?> Atualizar(int id, AtualizarCarroDTO dto);
    Task<CarroRespostaDTO?> Excluir(int id, AtualizarCarroDTO dto);
    
}