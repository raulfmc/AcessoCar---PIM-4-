using AcessoCar.Dtos.Alugueis;

namespace AcessoCar.Services.Alugueis;

public interface IAluguelService
{
    Task<IReadOnlyCollection<AluguelRespostaDTO>> Listar();
    Task<AluguelRespostaDTO?> BuscarPorId(int ID);
    Task<AluguelRespostaDTO?> Criar(CriarAluguelDTO dto);
    Task<AluguelRespostaDTO?> Atualizar(int id, AtualizarAluguelDTO dto);
    Task<AluguelRespostaDTO?> Excluir(int id, AtualizarAluguelDTO dto);

    
}