using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Dtos.Parcelas;

public class AtualizarParcelaDTO
{
    public decimal Valor {get; set;} 

    public DateTime Data_Vencimento {get; set;}

    public DateTime Data_Confirmacao {get; set;}

    public string Estado {get; set;} = string.Empty; 



}