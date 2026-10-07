using System.ComponentModel.DataAnnotations;
namespace AcessoCar.Dtos.Clientes;

public class AtualizarClienteDTO
{

    public string Nome { get; set; } = string.Empty;

    [RegularExpression(@"^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}")]
    public string CPF { get; set; } = string.Empty;

    public string Telefone { get; set; }  = string.Empty;

    [EmailAddress]
    public string Email { get; set; }  = string.Empty;

    public string Endereco { get; set; }  = string.Empty;

    public bool Ativo { get; set; }



}



