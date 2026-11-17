using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Models;

public class Parcela
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public decimal Valor {get; set;} 
  

    public DateTime Data_Vencimento {get; set;}

    public DateTime Data_Confirmacao {get; set;}

    public string Estado {get; set;} = string.Empty; 

    public bool Ativo {get; set;}
    public int Aluguel_ID {get; set;} 

    [ForeignKey("Aluguel_ID")]
    public Aluguel? aluguel { get; set; }



}