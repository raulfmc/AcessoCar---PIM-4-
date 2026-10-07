using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;
using AcessoCar.Models;
namespace AcessoCar.Dtos.Alugueis;

public class CriarAluguelDTO
{

    public DateTime Data_Inicio { get; set; }

    public DateTime Data_Fim { get; set; }

    public decimal Valor_Total { get; set; }

    public bool Ativo { get; set; }

    public int Carro_ID {get; set;}

    public int Cliente_ID {get; set;}




}



