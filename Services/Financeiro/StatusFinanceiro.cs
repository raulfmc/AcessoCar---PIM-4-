using AcessoCar.Models;

public static class StatusFinanceiro
{
    public static string Calcular(IEnumerable<Parcela> parcelas)
    {
        var lista = parcelas.ToList();

        if (!lista.Any())
            return "OK";
        var parcelasNaoPagas = parcelas
            .Where(p => p.Estado != "OK" &&
                        p.Data_Confirmacao == null)
            .ToList();

        if (!parcelasNaoPagas.Any())
            return "OK";

        if (parcelasNaoPagas.Any(p =>
            p.Data_Vencimento.Date < DateTime.Today))
        {
            return "ATRASADO";
        }

        return "PENDENTE";
    }
}