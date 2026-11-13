

using AcessoCar.Dtos.Dashboard;
namespace AcessoCar.Services.Dashboard;
public interface IDashboardService
{
    Task<DashboardDTO> ObterDados();
}