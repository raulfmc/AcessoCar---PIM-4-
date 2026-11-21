using AcessoCar.Dtos.Adaptacoes;
using AcessoCar.Dtos.Carros;

namespace AcessoCar.Services.Carros;

public interface ICarroService
{
    Task<IReadOnlyCollection<CarroRespostaDTO>> Listar();
    Task<CarroRespostaDTO?> BuscarPorId(int ID);
    Task<CarroCompletoRespostaDTO?> Criar(CriarCarroCompletoDTO dto);
    Task<CarroCompletoRespostaDTO?> Atualizar(int id, AtualizarCarroCompletoDTO dto);
    Task<string> CalcularEstado(int id);
    Task<CarroRespostaDTO?> Excluir(int id);
    
}