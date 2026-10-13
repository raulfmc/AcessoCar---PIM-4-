using AcessoCar.Dtos.Dividas;

namespace AcessoCar.Services.Dividas;

public interface IDividaService
{
    Task<IReadOnlyCollection<DividaRespostaDTO>> Listar();
    Task<DividaRespostaDTO?> BuscarPorId(int ID);
    Task<DividaRespostaDTO?> Criar(CriarDividaDTO dto);
    Task<DividaRespostaDTO?> Atualizar(int id, AtualizarDividaDTO dto);
    Task<DividaRespostaDTO?> Excluir(int id, AtualizarDividaDTO dto);
    
}