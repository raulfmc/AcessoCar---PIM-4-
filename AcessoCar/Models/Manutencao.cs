using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AcessoCar.Models;

public class Manutencao
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ID { get; set; }

    public string Descricao_Problema { get; set; } = string.Empty;

    public DateTime Data_Prevista_Conclusao { get; set; }

    public bool Ativo {get; set;}

    public int Carro_ID {get; set;}

    [ForeignKey("Carro_ID")]
    public Carro? carro { get; set; }


}
