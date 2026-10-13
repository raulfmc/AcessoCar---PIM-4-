using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Models;

public class Aluguel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public DateTime Data_Inicio { get; set; }

    public DateTime Data_Fim { get; set; }

    public decimal Valor_Total { get; set; }

    public bool Ativo { get; set; }

    public int Carro_ID {get; set;}

    public int Cliente_ID {get; set;}

    [ForeignKey("Carro_ID")]
    public Carro? carro { get; set; }
    [ForeignKey("Cliente_ID")]
    public Cliente? cliente { get; set; }


}
