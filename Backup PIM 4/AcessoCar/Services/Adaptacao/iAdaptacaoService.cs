using AcessoCar.Dtos.Adaptacoes;

namespace AcessoCar.Services.Adaptacoes;

public interface IAdaptacaoService
{
    Task<IReadOnlyCollection<AdaptacaoRespostaDTO>> Listar();
    Task<AdaptacaoRespostaDTO?> BuscarPorId(int ID);
    Task<AdaptacaoRespostaDTO?> Criar(CriarAdaptacaoDTO dto);
    Task<AdaptacaoRespostaDTO?> Atualizar(int id, AtualizarAdaptacaoDTO dto);
    Task<AdaptacaoRespostaDTO?> Excluir(int id, AtualizarAdaptacaoDTO dto);
    
}

