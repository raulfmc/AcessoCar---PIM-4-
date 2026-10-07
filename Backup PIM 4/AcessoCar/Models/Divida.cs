using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
namespace AcessoCar.Models;

public class Divida
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public DateTime Data_Criacao { get; set; }

    public string Tipo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public decimal Valor {get; set;}

    public bool Ativo {get; set;}

    public int Aluguel_ID {get; set;}

    [ForeignKey("Aluguel_ID")]
    public Aluguel? aluguel { get; set; }

}
