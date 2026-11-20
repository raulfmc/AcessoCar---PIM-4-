using AcessoCar.Models;

namespace AcessoCar.Services.Parcelas;

public static class ParcelaRegras
{
    public static string ObterSituacao(Parcela parcela)
    {
        if (parcela.Estado == "OK")
            return "OK";

        return parcela.Data_Vencimento.Date < DateTime.Today
            ? "ATRASADO"
            : "PENDENTE";
    }
}