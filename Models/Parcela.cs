using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AcessoCar.Models;

public class Parcela
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public decimal Valor {get; set;} 
  

    public DateTime Data_Vencimento {get; set;}

    public DateTime? Data_Confirmacao {get; set;}

    public string Estado {get; set;} = string.Empty; 

    public int Numero {get; set;}
    public bool Ativo {get; set;}
    public int Aluguel_ID {get; set;} 
    [JsonIgnore]
    [ForeignKey("Aluguel_ID")]
    public Aluguel? aluguel { get; set; }



}