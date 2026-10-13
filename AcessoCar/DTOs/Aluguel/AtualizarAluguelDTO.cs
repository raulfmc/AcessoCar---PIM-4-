using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;
namespace AcessoCar.Dtos.Alugueis;

public class AtualizarAluguelDTO
{

    public DateTime Data_Inicio { get; set; }

    public DateTime Data_Fim { get; set; }

    public decimal Valor_Total { get; set; }

    public bool Ativo { get; set; }

   

}



