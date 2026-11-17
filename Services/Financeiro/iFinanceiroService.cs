

using AcessoCar.Dtos.Financeiro;


namespace AcessoCar.Services.Financeiro;
public interface IFinanceiroService
{
    Task<List<FinanceiroDTO>> ObterDados();
}