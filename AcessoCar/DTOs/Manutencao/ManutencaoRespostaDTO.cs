using AcessoCar.Models;

namespace AcessoCar.Dtos.Manutencoes;

public class ManutencaoRespostaDTO
{
    public int ID { get; set; }
    public string Descricao_Problema { get; set; } = string.Empty;

    public DateTime Data_Prevista_Conclusao { get; set; }

    public bool Ativo {get; set;}

    public Carro? carro {get; set;}
}



