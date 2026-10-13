
namespace AcessoCar.Dtos.Dividas;

public class AtualizarDividaDTO
{

    public DateTime Data_Criacao { get; set; }

    public string Tipo { get; set; } = string.Empty;

    public decimal Valor {get; set;}

    public string Descricao { get; set; } = string.Empty;


}



