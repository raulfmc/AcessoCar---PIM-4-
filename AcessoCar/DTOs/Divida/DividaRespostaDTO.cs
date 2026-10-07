using AcessoCar.Models;

namespace AcessoCar.Dtos.Dividas;

public class DividaRespostaDTO
{
    public int ID { get; set; }
    public DateTime Data_Criacao { get; set; }

    public string Tipo { get; set; } = string.Empty;

    public decimal Valor { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public bool Ativo { get; set; }

    public int Aluguel_ID {get; set;}
    public Aluguel? aluguel { get; set; }
}



