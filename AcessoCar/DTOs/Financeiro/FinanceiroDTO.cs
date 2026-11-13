

namespace AcessoCar.Dtos.Financeiro;


public class FinanceiroDTO
{
    public string clienteNome {get; set;} = string.Empty;

    public int clienteID { get; set; }

    public int qtdParcelas { get; set; }

    public decimal valorEmAberto { get; set; }

    public DateTime proxVencimento { get; set; }




}