using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AcessoCar.Models;
namespace AcessoCar.Dtos.Parcelas;

public class ParcelaRespostaDTO
{
    public int ID { get; set; }

    public decimal Valor {get; set;} 

    public DateTime Data_Vencimento {get; set;}

    public DateTime Data_Confirmacao {get; set;}

    public string Estado {get; set;} = string.Empty; 

    public bool Ativo {get; set;}
    public int Aluguel_ID {get; set;} 
    public Aluguel? aluguel { get; set; }



}