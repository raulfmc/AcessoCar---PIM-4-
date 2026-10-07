using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Dtos.Adaptacoes;

public class AtualizarAdaptacaoDTO
{
    
    public string Nome { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public int Carro_ID {get; set;}
    
    public bool Ativo {get; set;}

}



    