namespace AcessoCar.Dtos.Dashboard;
public class DashboardDTO
{
    //Financeiro
    public int parcelasPendentes {get; set;}

    public int pagamentosPendentes {get; set;}

    public decimal totalPendente {get; set;}
 
    public int parcelasNaoConfirmadas {get; set;}

    public int pagamentosVencidos {get; set;}

    public int clientes {get; set;}

    public int parcelasVencidas {get; set;}
    public decimal totalAtrasado {get; set;}
    public int parcelasConfirmadas {get; set;}

    public int locacoesAtivas {get; set;}
    
    //Frota
    public int carrosDisponiveis {get; set;}

    public int carrosLocados {get; set;}

    public int carrosManutencao {get; set;}

    // Gráfico financeiro
    public List<PagamentoMensalDTO> pagamentoMensal { get; set; } = new();
}

public class PagamentoMensalDTO
{
    public string mes { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}