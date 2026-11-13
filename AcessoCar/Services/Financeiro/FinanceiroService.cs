using Microsoft.EntityFrameworkCore;
using AcessoCar.Data;
using AcessoCar.Dtos.Financeiro;
using System.Globalization;
using AcessoCar.Models;

namespace AcessoCar.Services.Financeiro;

public class FinanceiroService : IFinanceiroService
{

    private readonly AppDbContext _context;

    public FinanceiroService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<FinanceiroDTO>> ObterDados()
    {


        return await _context.Parcela
        .Where(p => p.Estado == "PENDENTE" || p.Estado == "ATRASADO")
        .GroupBy(p => p.aluguel!.Cliente_ID)
        .Select(g => new FinanceiroDTO
        {
            clienteID = g.Key,
            clienteNome = g.First().aluguel!.cliente!.Nome,
            qtdParcelas = g.Count(),
            valorEmAberto = g.Sum(p => p.Valor),
            proxVencimento = g.Min(p => p.Data_Vencimento)
        })
        .ToListAsync();

    }


}



