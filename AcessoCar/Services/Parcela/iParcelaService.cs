using AcessoCar.Dtos.Manutencoes;
using AcessoCar.Dtos.Parcelas;

namespace AcessoCar.Services.Parcelas;

public interface IParcelaService
{
    Task<IReadOnlyCollection<ParcelaRespostaDTO>> Listar();
    Task<ParcelaRespostaDTO?> BuscarPorId(int ID);
    Task<ParcelaRespostaDTO?> Criar(CriarParcelaDTO dto);
    Task<ParcelaRespostaDTO?> Atualizar(int id, AtualizarParcelaDTO dto);
    Task<ParcelaRespostaDTO?> Excluir(int id);
    
}