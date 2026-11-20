using System.ComponentModel.DataAnnotations;


namespace AcessoCar.Dtos.Carros;

public class AtualizarCarroDTO
{

    public string Marca { get; set; } = string.Empty;

    public string Modelo { get; set; } = string.Empty;

    public int Ano_Fabricacao { get; set; }

    [StringLength(15)]
    public string Versao { get; set; } = string.Empty;

    public int Numero { get; set; }

    public string Cambio { get; set; } = string.Empty;

    [RegularExpression(
    "^([A-Z]{3}-[0-9]{4}|[A-Z]{3}[0-9][A-Z0-9][0-9]{2})$",
    ErrorMessage = "Formato de placa inválido."
    )]  
    public string Placa { get; set; } = string.Empty;

    public string Cor { get; set; } = string.Empty;

    public decimal Valor_Diaria { get; set; }



}



