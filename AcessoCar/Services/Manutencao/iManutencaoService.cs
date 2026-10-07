using AcessoCar.Dtos.Manutencoes;

namespace AcessoCar.Services.Manutencoes;

public interface IManutencaoService
{
    Task<IReadOnlyCollection<ManutencaoRespostaDTO>> Listar();
    Task<ManutencaoRespostaDTO?> BuscarPorId(int ID);
    Task<ManutencaoRespostaDTO?> Criar(CriarManutencaoDTO dto);
    Task<ManutencaoRespostaDTO?> Atualizar(int id, AtualizarManutencaoDTO dto);
    Task<ManutencaoRespostaDTO?> Excluir(int id, AtualizarManutencaoDTO dto);
    
}