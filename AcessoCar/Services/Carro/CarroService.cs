using AcessoCar.Dtos.Carros;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
using AcessoCar.Exceptions;
using Microsoft.Data.SqlClient;
using AcessoCar.Services.Adaptacoes;
using AcessoCar.Dtos.Adaptacoes;
namespace AcessoCar.Services.Carros;

public class CarroService : ICarroService
{

    private readonly AppDbContext _context;
    private readonly IAdaptacaoService _adaptacaoService;
    public CarroService(AppDbContext context, IAdaptacaoService adaptacaoService)
    {
        _context = context;
        _adaptacaoService = adaptacaoService;
    }
    public async Task<IReadOnlyCollection<CarroRespostaDTO>> Listar()
    {
        var Carros = await _context.Carro
        .Where(c => c.Ativo == true)
        .ToListAsync();

        return Carros
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<CarroRespostaDTO?> BuscarPorId(int id)
    {
        Carro? Carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (Carro == null || Carro.Ativo == false)
        {
            throw new KeyNotFoundException("Carro não encontrado");
        }


        return ConverterParaResposta(Carro);

    }
    async public Task<CarroRespostaDTO?> Criar(CriarCarroDTO dto,
    CriarAdaptacaoDTO adaptacaoDTO)
    {
        await using var transaction =
        await _context.Database.BeginTransactionAsync();

        try
        {
            Carro carro = new Carro()
            {
                Marca = dto.Marca,
                Modelo = dto.Modelo,
                Ano_Fabricacao = dto.Ano_Fabricacao,
                Numero = dto.Numero,
                Versao = dto.Versao,
                Cambio = dto.Cambio,
                Placa = dto.Placa,
                Cor = dto.Cor,
                Estado = "DISPONÍVEL",
                Qtd_Alugueis = 0,
                Valor_Diaria = dto.Valor_Diaria,
                Ativo = true
            };

            _context.Carro.Add(carro);
            await _context.SaveChangesAsync();
            adaptacaoDTO.Carro_ID = carro.ID;

            var adaptacao = await _adaptacaoService.Criar(adaptacaoDTO);
            if (adaptacao == null)
            {
                throw new InvalidOperationException("Não foi possível cadastrar a adaptação do veículo.");
            }

            await transaction.CommitAsync();

            return ConverterParaResposta(carro);

        }
        catch (DbUpdateException ex)
            when (ex.InnerException is SqlException sql &&
            (sql.Number == 2601 || sql.Number == 2627) &&
            sql.Message.Contains("UQ_Placa",
                StringComparison.OrdinalIgnoreCase))
        {
            await transaction.RollbackAsync();

            throw new PlacaRepetidaException(
                "Essa placa já existe, insira outra placa.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<CarroRespostaDTO?> Atualizar(int id, AtualizarCarroDTO dto)
    {

        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (carro == null)
        {
            return null;
        }


        carro.Marca = dto.Marca;
        carro.Modelo = dto.Modelo;
        carro.Ano_Fabricacao = dto.Ano_Fabricacao;
        carro.Numero = dto.Numero;
        carro.Versao = dto.Versao;
        carro.Cambio = dto.Cambio;
        carro.Placa = dto.Placa;
        carro.Cor = dto.Cor;
        carro.Estado = dto.Estado;
        carro.Valor_Diaria = dto.Valor_Diaria;
        _context.Carro.Update(carro);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(carro);
    }
    public async Task<CarroRespostaDTO?> Excluir(int id)
    {
        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (carro is null)
        {
            return null;
        }
        carro.Ativo = false;
        _context.Carro.Update(carro);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(carro);
    }
    private static CarroRespostaDTO ConverterParaResposta(
        Carro carro
    )
    {
        return new CarroRespostaDTO
        {
            ID = carro.ID,
            Marca = carro.Marca,
            Modelo = carro.Modelo,
            Ano_Fabricacao = carro.Ano_Fabricacao,
            Numero = carro.Numero,
            Versao = carro.Versao,
            Cambio = carro.Cambio,
            Placa = carro.Placa,
            Cor = carro.Cor,
            Estado = carro.Estado,
            Qtd_Alugueis = carro.Qtd_Alugueis,
            Valor_Diaria = carro.Valor_Diaria,
            Ativo = carro.Ativo

        };
    }



}