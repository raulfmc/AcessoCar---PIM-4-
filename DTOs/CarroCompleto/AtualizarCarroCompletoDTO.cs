using AcessoCar.Dtos.Adaptacoes;
namespace AcessoCar.Dtos.Carros;


public class AtualizarCarroCompletoDTO
{
    public AtualizarCarroDTO Carro { get; set; } = new();

    public AtualizarAdaptacaoDTO Adaptacao { get; set; } = new();
}