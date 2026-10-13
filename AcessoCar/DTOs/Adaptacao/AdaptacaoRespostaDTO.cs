using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AcessoCar.Models;
namespace AcessoCar.Dtos.Adaptacoes;

public class AdaptacaoRespostaDTO
{
    public int ID {get; set;}
    public string Nome { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public int Carro_ID {get; set;}
    
    public bool Ativo {get; set;}

    public Carro? carro {get; set;}
    

}



    