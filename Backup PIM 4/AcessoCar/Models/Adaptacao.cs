using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Models;

public class Adaptacao
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Tipo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public bool Ativo {get; set;}
    
    public int Carro_ID {get; set;}

    [ForeignKey("Carro_ID")]
    public Carro? carro { get; set; }


}
