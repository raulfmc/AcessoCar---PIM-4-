using AcessoCar.Models;

namespace AcessoCar.Dtos.Dividas;

public class CriarDividaDTO
{

    public DateTime Data_Criacao { get; set; }

    public string Tipo { get; set; } = string.Empty;

    public decimal Valor {get; set;}

    public string Descricao { get; set; } = string.Empty;

    public int Aluguel_ID {get; set;}

    public bool Ativo {get; set;}
    


}



