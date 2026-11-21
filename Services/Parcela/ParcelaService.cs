using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Dtos.Parcelas;
using AcessoCar.Models;

namespace AcessoCar.Services.Parcelas;

public class ParcelaService : IParcelaService
{

    private readonly AppDbContext _context;
    public ParcelaService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<ParcelaRespostaDTO>> Listar()
    {
        var Parcelas = await _context.Parcela
        .Where(Parcela => Parcela.Ativo == true)
        .Include(Parcela => Parcela.aluguel)
        .ToListAsync();

        return Parcelas
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<ParcelaRespostaDTO?> BuscarPorId(int id)
    {
        Parcela? parcela = await _context.Parcela
        .FirstOrDefaultAsync(Parcela => Parcela.ID == id);

        if (parcela == null || parcela.Ativo == false)
        {
            return null;
        }


        return ConverterParaResposta(parcela);

    }
    async public Task<ParcelaRespostaDTO?> Criar(CriarParcelaDTO dto)
    {
        var aluguel = await _context.Aluguel
        .FirstOrDefaultAsync(a => a.ID == dto.Aluguel_ID);

        if (aluguel == null)
            throw new KeyNotFoundException("Aluguel não encontrado.");

        // int numeroParcela =
        //     (dto.Data_Vencimento.Year - aluguel.Data_Inicio.Year) * 12
        //     + dto.Data_Vencimento.Month - aluguel.Data_Inicio.Month
        //     + 1;

        // if (numeroParcela <= 0)
        //     throw new ArgumentException("A data de vencimento deve ser posterior ou igual ao início do aluguel.");
        Parcela Parcela = new Parcela()
        {

            Valor = dto.Valor,
            Data_Vencimento = dto.Data_Vencimento,
            Data_Confirmacao = dto.Data_Confirmacao,
            Numero = dto.Numero,
            // Numero = numeroParcela,
            Estado = dto.Estado,
            Ativo = true,
            Aluguel_ID = dto.Aluguel_ID



        };
        _context.Parcela.Add(Parcela);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(Parcela);
    }

    public async Task<ParcelaRespostaDTO?> Atualizar(int id, AtualizarParcelaDTO dto)
    {

        Parcela? Parcela = await _context.Parcela
        .FirstOrDefaultAsync(Parcela => Parcela.ID == id);

        if (Parcela == null)
        {
            return null;
        }


        Parcela.Valor = dto.Valor;
        Parcela.Data_Vencimento = dto.Data_Vencimento;
        Parcela.Data_Confirmacao = dto.Data_Confirmacao;
        Parcela.Estado = dto.Estado;


        _context.Parcela.Update(Parcela);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(Parcela);
    }
    public async Task<ParcelaRespostaDTO?> Excluir(int id)
    {
        Parcela? Parcela = await _context.Parcela
        .FirstOrDefaultAsync(Parcela => Parcela.ID == id);

        if (Parcela is null)
        {
            throw new KeyNotFoundException("Manutenção não encontrada");
        }
        Parcela.Ativo = false;
        _context.Parcela.Update(Parcela);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(Parcela);
    }
    public async Task ConfirmarPagamento(int id)
    {
        var parcela = await _context.Parcela
            .FirstOrDefaultAsync(p => p.ID == id);

        if (parcela == null)
            throw new KeyNotFoundException("Parcela não encontrada.");

        if (parcela.Data_Confirmacao.HasValue)
            throw new InvalidOperationException("Esta parcela já foi paga.");

        parcela.Data_Confirmacao = DateTime.Now;
        parcela.Estado = "OK";

        await _context.SaveChangesAsync();
    }
    private static ParcelaRespostaDTO ConverterParaResposta(
        Parcela Parcela
    )
    {
        return new ParcelaRespostaDTO
        {
            ID = Parcela.ID,
            Valor = Parcela.Valor,
            Data_Vencimento = Parcela.Data_Vencimento,
            Estado = ParcelaRegras.ObterSituacao(Parcela),
            Numero = Parcela.Numero,
            Data_Confirmacao = Parcela.Data_Confirmacao,
            Aluguel_ID = Parcela.Aluguel_ID,
            aluguel = Parcela.aluguel,
            Ativo = Parcela.Ativo


        };
    }



}