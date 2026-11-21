using AcessoCar.Models;

namespace AcessoCar.Dtos.Manutencoes;
public class CriarManutencaoDTO
{

    public string Descricao { get; set; } = string.Empty;

    public DateTime Data_Prevista_Conclusao { get; set; }
    
    public decimal Valor {get; set;}

    //public bool Ativo {get; set;} = true;

    public int Carro_ID {get; set;}
}
    



