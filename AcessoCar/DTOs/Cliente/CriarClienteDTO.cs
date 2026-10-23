using System.ComponentModel.DataAnnotations;
namespace AcessoCar.Dtos.Clientes;
public class CriarClienteDTO
{

    public string Nome { get; set; } = string.Empty;

    [RegularExpression(@"^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}")]
    public string CPF { get; set; } = string.Empty;
    [RegularExpression(@"^\([1-9]{2}\)9[0-9]{4}-[0-9]{4}")]
    public string Telefone { get; set; }  = string.Empty;

    [EmailAddress]
    public string Email { get; set; }  = string.Empty;

    public string Endereco { get; set; }  = string.Empty;

    public bool Ativo { get; set; } = true;


}



