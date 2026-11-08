using AcessoCar.Dtos.Alugueis;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
using System.Data;

namespace AcessoCar.Services.Alugueis;

public class AluguelService : IAluguelService
{

    private readonly AppDbContext _context;
    public AluguelService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<AluguelRespostaDTO>> Listar()
    {
        var Adaptacoes = await _context.Aluguel
        .Include(Aluguel => Aluguel.carro)
        .Include(Aluguel => Aluguel.cliente)
        .Where(Aluguel => Aluguel.Ativo == true)
        .ToListAsync();

        return Adaptacoes
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<AluguelRespostaDTO?> BuscarPorId(int ID)
    {
        Aluguel? aluguel = await _context.Aluguel
        .Include(aluguel => aluguel.carro)
        .Include(aluguel => aluguel.cliente)
        .FirstOrDefaultAsync(aluguel => aluguel.ID == ID);

        if (aluguel == null || aluguel.Ativo == false)
        {
            return null;
        }


        return ConverterParaResposta(aluguel);

    }
    async public Task<AluguelRespostaDTO?> Criar(CriarAluguelDTO dto)

    {
        await using var transacao = await _context.Database
        .BeginTransactionAsync(IsolationLevel.Serializable);
        try
        {
           bool indisponivel = await _context.Aluguel.AnyAsync(a =>
           a.Carro_ID == dto.Carro_ID &&
           a.Ativo &&
           a.Data_Inicio < dto.Data_Fim &&
           a.Data_Fim > dto.Data_Inicio
       );

            if (indisponivel)
            {
                throw new InvalidOperationException(
                    "Já há uma locação nesse período para esse carro"
                );
            }
            //implementar verificação da dívida
            Carro? carro = await _context.Carro
            .FirstOrDefaultAsync(c => dto.Carro_ID == c.ID);
            if (carro == null)
            {
                throw new Exception($"Carro não encontrado");
            }
            Cliente? cliente = await _context.Cliente
            .FirstOrDefaultAsync(c => dto.Cliente_ID == c.ID);

            if (cliente == null)
            {
                throw new Exception($"Cliente não encontrado");
            }
            DateTime inicio = dto.Data_Inicio.Date;
            DateTime fim = dto.Data_Fim.Date;
            bool ocupado = await _context.Aluguel.AnyAsync(a =>
             a.Carro_ID == dto.Carro_ID && a.Ativo &&
             a.Data_Inicio < fim && inicio < a.Data_Fim);
            if (ocupado)
                throw new InvalidOperationException("Veículo já reservado.");
                
            Aluguel Aluguel = new Aluguel()
            {
                Data_Inicio = dto.Data_Inicio,
                Data_Fim = dto.Data_Fim,
                Carro_ID = dto.Carro_ID,
                Valor_Total = dto.Valor_Total,
                Parcelas = dto.Parcelas,
                Estado = "OK",
                Ativo = dto.Ativo,
                Cliente_ID = dto.Cliente_ID,
                carro = carro,
                cliente = cliente
            };
            _context.Aluguel.Add(Aluguel);
            await _context.SaveChangesAsync();
            return ConverterParaResposta(Aluguel);
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }
    }

    public async Task<AluguelRespostaDTO?> Atualizar(int id, AtualizarAluguelDTO dto)
    {
        Aluguel? aluguel = await _context.Aluguel
        .FirstOrDefaultAsync(Aluguel => Aluguel.ID == id);

        if (aluguel == null)
        {
            return null;
        }

        aluguel.Data_Inicio = dto.Data_Inicio;
        aluguel.Data_Fim = dto.Data_Fim;
        aluguel.Valor_Total = dto.Valor_Total;
        await _context.SaveChangesAsync();
        return ConverterParaResposta(aluguel);
    }
    public async Task<AluguelRespostaDTO?> Excluir(int id)
    {
        Aluguel? aluguel = await _context.Aluguel
        .Include(Aluguel => Aluguel.carro)
        .FirstOrDefaultAsync(Aluguel => Aluguel.ID == id);

        if (aluguel is null)
        {
            return null;
        }
        aluguel.Ativo = false;
        await _context.SaveChangesAsync();

        return ConverterParaResposta(aluguel);
    }
    private static AluguelRespostaDTO ConverterParaResposta(
        Aluguel aluguel
    )
    {
        return new AluguelRespostaDTO
        {
            ID = aluguel.ID,
            Data_Inicio = aluguel.Data_Inicio,
            Data_Fim = aluguel.Data_Fim,
            Valor_Total = aluguel.Valor_Total,
            Parcelas = aluguel.Parcelas,
            Estado = aluguel.Estado,
            Carro_ID = aluguel.Carro_ID,
            Cliente_ID = aluguel.Cliente_ID,
            carro = aluguel.carro,
            cliente = aluguel.cliente,
            Ativo = aluguel.Ativo

        };
    }



}