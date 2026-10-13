using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;
using AcessoCar.Models;
namespace AcessoCar.Dtos.Adaptacoes;

public class CriarAdaptacaoDTO
{
    
    public string Nome { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public bool Ativo {get; set;}
    
    public int Carro_ID {get;set;}

   

}



    