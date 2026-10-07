namespace AcessoCar.Dtos.Manutencoes;

public class AtualizarManutencaoDTO
{

    public string Descricao_Problema { get; set; } = string.Empty;

    public DateTime Data_Prevista_Conclusao { get; set; }

    public bool Ativo {get; set;}

}



