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

        var carros = await _context.Carro
       .Where(c => c.Ativo == true)
       .ToListAsync();

        var respostas = new List<CarroRespostaDTO>();

        foreach (var carro in carros)
        {
            respostas.Add(await ConverterParaResposta(carro));
        }
        return respostas;
        // var Carros = await _context.Carro
        // .Where(c => c.Ativo == true)
        // .ToListAsync();

        // return Carros
        // .Select(ConverterParaResposta)
        // .ToList();


    }

    async public Task<CarroRespostaDTO?> BuscarPorId(int id)
    {
        Carro? carro = await _context.Carro

        .FirstOrDefaultAsync(Carro => Carro.ID == id);


        if (carro == null)
        {
            throw new KeyNotFoundException("Carro não encontrado");
        }

        return await ConverterParaResposta(carro);

    }
    public async Task<CarroRespostaDTO?> CriarSimples(CriarCarroDTO dto)
    {
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

            return await ConverterParaResposta(carro);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is SqlException sql &&
            (sql.Number == 2601 || sql.Number == 2627) &&
            sql.Message.Contains("UQ_Placa",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new PlacaRepetidaException(
                "Essa placa já existe, insira outra placa.");
        }
    }
    // async public Task<CarroCompletoRespostaDTO?> Criar(CriarCarroCompletoDTO dto)
    // {
    //     await using var transaction =
    //    await _context.Database.BeginTransactionAsync();

    //     try
    //     {
    //         Carro carro = new Carro()
    //         {
    //             Marca = dto.carro.Marca,
    //             Modelo = dto.carro.Modelo,
    //             Ano_Fabricacao = dto.carro.Ano_Fabricacao,
    //             Numero = dto.carro.Numero,
    //             Versao = dto.carro.Versao,
    //             Cambio = dto.carro.Cambio,
    //             Placa = dto.carro.Placa,
    //             Cor = dto.carro.Cor,
    //             Estado = "DISPONÍVEL",
    //             Qtd_Alugueis = 0,
    //             Valor_Diaria = dto.carro.Valor_Diaria,
    //             Ativo = true
    //         };

    //         _context.Carro.Add(carro);
    //         await _context.SaveChangesAsync();

    //         // Vincula a adaptação ao carro recém-criado
    //         dto.adaptacao.Carro_ID = carro.ID;

    //         var adaptacao = await _adaptacaoService.Criar(dto.adaptacao);

    //         if (adaptacao == null)
    //         {
    //             throw new InvalidOperationException(
    //                 "Não foi possível cadastrar a adaptação do veículo.");
    //         }

    //         await transaction.CommitAsync();

    //         return new CarroCompletoRespostaDTO
    //         {
    //             Carro = await ConverterParaResposta(carro),
    //             Adaptacao = adaptacao
    //         };
    //     }
    //     catch (DbUpdateException ex)
    //         when (ex.InnerException is SqlException sql &&
    //         (sql.Number == 2601 || sql.Number == 2627) &&
    //         sql.Message.Contains("UQ_Placa",
    //             StringComparison.OrdinalIgnoreCase))
    //     {
    //         await transaction.RollbackAsync();

    //         throw new PlacaRepetidaException(
    //             "Essa placa já existe, insira outra placa.");
    //     }
    //     catch
    //     {
    //         await transaction.RollbackAsync();
    //         throw;
    //     }
    //     // await using var transaction =
    //     // await _context.Database.BeginTransactionAsync();

    //     // try
    //     // {
    //     //     Carro carro = new Carro()
    //     //     {
    //     //         Marca = dto.Marca,
    //     //         Modelo = dto.Modelo,
    //     //         Ano_Fabricacao = dto.Ano_Fabricacao,
    //     //         Numero = dto.Numero,
    //     //         Versao = dto.Versao,
    //     //         Cambio = dto.Cambio,
    //     //         Placa = dto.Placa,
    //     //         Cor = dto.Cor,
    //     //         Estado = "DISPONÍVEL",
    //     //         Qtd_Alugueis = 0,
    //     //         Valor_Diaria = dto.Valor_Diaria,
    //     //         Ativo = true
    //     //     };

    //     //     _context.Carro.Add(carro);
    //     //     await _context.SaveChangesAsync();
    //     //     adaptacaoDTO.Carro_ID = carro.ID;

    //     //     var adaptacao = await _adaptacaoService.Criar(adaptacaoDTO);
    //     //     Console.WriteLine($"ID da adaptação retornado: {adaptacao?.ID}");
    //     //     if (adaptacao == null)
    //     //     {
    //     //         throw new InvalidOperationException("Não foi possível cadastrar a adaptação do veículo.");
    //     //     }

    //     //     await transaction.CommitAsync();

    //     //     return ConverterParaResposta(carro);

    //     // }
    //     // catch (DbUpdateException ex)
    //     //     when (ex.InnerException is SqlException sql &&
    //     //     (sql.Number == 2601 || sql.Number == 2627) &&
    //     //     sql.Message.Contains("UQ_Placa",
    //     //         StringComparison.OrdinalIgnoreCase))
    //     // {
    //     //     await transaction.RollbackAsync();

    //     //     throw new PlacaRepetidaException(
    //     //         "Essa placa já existe, insira outra placa.");
    //     // }
    //     // catch
    //     // {
    //     //     await transaction.RollbackAsync();
    //     //     throw;
    //     // }
    // }

    public async Task<CarroRespostaDTO?> Atualizar(int id, AtualizarCarroDTO dto)
    {
        Carro? carro = await _context.Carro
               .FirstOrDefaultAsync(c => c.ID == id);

        if (carro == null)
            return null;

        // Adaptacao? adaptacao = await _context.Adaptacao
        //     .FirstOrDefaultAsync(a =>
        //         a.ID == dto.Adaptacao.ID &&
        //         a.Carro_ID == id &&
        //         a.Ativo);

        // if (adaptacao == null)
        //     return null;


        carro.Marca = dto.Marca;
        carro.Modelo = dto.Modelo;
        carro.Ano_Fabricacao = dto.Ano_Fabricacao;
        carro.Numero = dto.Numero;
        carro.Versao = dto.Versao;
        carro.Cambio = dto.Cambio;
        carro.Placa = dto.Placa;
        carro.Cor = dto.Cor;
        carro.Valor_Diaria = dto.Valor_Diaria;


        // adaptacao.Nome = dto.Adaptacao.Nome;
        // adaptacao.Tipo = dto.Adaptacao.Tipo;

        await _context.SaveChangesAsync();
        return await ConverterParaResposta(carro);
        // return new CarroCompletoRespostaDTO
        // {
        //     Carro = await ConverterParaResposta(carro),

        //     Adaptacao = new AdaptacaoRespostaDTO
        //     {
        //         ID = adaptacao.ID,
        //         Nome = adaptacao.Nome,
        //         Tipo = adaptacao.Tipo,
        //         Carro_ID = carro.ID,
        //         carro = carro
        //     }
        // };
        // Carro? carro = await _context.Carro
        // .FirstOrDefaultAsync(Carro => Carro.ID == id);

        // if (carro == null)
        // {
        //     Console.WriteLine($"CARRO NÃO ENCONTRADO. ID: {id}");
        //     return null;
        // }
        // Console.WriteLine($"CARRO ENCONTRADO. ID: {carro.ID}");

        // carro.Marca = dto.Carro.Marca;
        // carro.Modelo = dto.Carro.Modelo;
        // carro.Ano_Fabricacao = dto.Carro.Ano_Fabricacao;
        // carro.Numero = dto.Carro.Numero;
        // carro.Versao = dto.Carro.Versao;
        // carro.Cambio = dto.Carro.Cambio;
        // carro.Placa = dto.Carro.Placa;
        // carro.Cor = dto.Carro.Cor;
        // carro.Valor_Diaria = dto.Carro.Valor_Diaria;
        // Adaptacao? adaptacao = await _context.Adaptacao
        //     .FirstOrDefaultAsync(a =>
        //         a.ID == dto.Adaptacao.ID &&
        //         a.Ativo);

        // if (adaptacao == null)
        // {
        //     Console.WriteLine($"ADAPTAÇÃO NÃO ENCONTRADA. ID: {dto.Adaptacao.ID}");
        //     return null;
        // }
        // Console.WriteLine($"ADAPTAÇÃO ENCONTRADA. ID: {adaptacao.ID}");
        // // Atualiza os dados da adaptação
        // adaptacao.Nome = dto.Adaptacao.Nome;
        // adaptacao.Tipo = dto.Adaptacao.Tipo;


        // await _context.SaveChangesAsync();
        // _context.Carro.Update(carro);
        // Console.WriteLine($"Placa recebida: [{dto.Carro.Placa}]");
        // Console.WriteLine($"Tamanho recebido: {dto.Carro.Placa?.Length}");
        // Console.WriteLine($"Placa na entidade: [{carro.Placa}]");
        // await _context.SaveChangesAsync();
        // return ConverterParaResposta(carro);

    }
    public async Task<CarroRespostaDTO?> Excluir(int id)
    {
        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (carro is null)
        {
            return null;
        }
        bool possuiAluguel = await _context.Aluguel
        .AnyAsync(a => a.Carro_ID == id);

        bool possuiManutencao = await _context.Manutencao
            .AnyAsync(m => m.Carro_ID == id);
        if (possuiAluguel)
        {
            throw new AluguelComCarroException(
                "Não é possível excluir este veículo, pois ele possui aluguéis associados."
            );
        }

        if (possuiManutencao)
        {
            throw new CarroEmManutencaoException(
                "Não é possível excluir este veículo, pois ele possui manutenções associadas."
            );
        }
        carro.Ativo = false;

        await _context.SaveChangesAsync();

        return await ConverterParaResposta(carro);
    }
    public async Task<string> CalcularEstado(int carroId)
    {
        bool emManutencao = await _context.Manutencao.AnyAsync(m =>
            m.Carro_ID == carroId &&
            m.Ativo == true
        );

        if (emManutencao)
            return "EM MANUTENÇÃO";

        bool locado = await _context.Aluguel.AnyAsync(a =>
            a.Carro_ID == carroId &&
            a.Ativo == true
        );

        if (locado)
            return "LOCADO";

        return "DISPONÍVEL";
    }
    private async Task<CarroRespostaDTO> ConverterParaResposta(
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
            Estado = await CalcularEstado(carro.ID),
            Qtd_Alugueis = carro.Qtd_Alugueis,
            Valor_Diaria = carro.Valor_Diaria,
            Ativo = carro.Ativo
        };
    }

    // private static CarroRespostaDTO ConverterParaResposta(
    //     Carro carro
    // )
    // {
    //     return new CarroRespostaDTO
    //     {
    //         ID = carro.ID,
    //         Marca = carro.Marca,
    //         Modelo = carro.Modelo,
    //         Ano_Fabricacao = carro.Ano_Fabricacao,
    //         Numero = carro.Numero,
    //         Versao = carro.Versao,
    //         Cambio = carro.Cambio,
    //         Placa = carro.Placa,
    //         Cor = carro.Cor,
    //         Estado = carro.Estado,
    //         Qtd_Alugueis = carro.Qtd_Alugueis,
    //         Valor_Diaria = carro.Valor_Diaria,
    //         Ativo = carro.Ativo

    //     };
    // }



}