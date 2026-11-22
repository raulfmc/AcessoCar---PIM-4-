using Microsoft.EntityFrameworkCore;
using AcessoCar.Data;
using AcessoCar.Dtos.Financeiro;
using AcessoCar.Models;
using AcessoCar.Services.Parcelas;

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
        var parcelas = await _context.Parcela
            .Where(p => p.Ativo &&
                        p.aluguel != null &&
                        p.aluguel.Ativo &&
                        p.aluguel.cliente != null)
            .Include(p => p.aluguel)
                .ThenInclude(a => a!.cliente)
            .ToListAsync();

        return parcelas
            .Where(p => p.aluguel != null && p.aluguel.cliente != null)
            .GroupBy(p => p.aluguel!.Cliente_ID)
            .Select(g =>
            {
                var parcelasAbertas = g
                    .Where(p => p.Estado != "OK")
                    .ToList();

                if (parcelasAbertas.Count == 0)
                    return null;

                var situacoes = parcelasAbertas
                    .Select(ParcelaRegras.ObterSituacao)
                    .ToList();

                string situacao = situacoes.Contains("ATRASADO")
                    ? "ATRASADO"
                    : "PENDENTE";

                return new FinanceiroDTO
                {
                    clienteID = g.Key,
                    clienteNome = g.First().aluguel!.cliente!.Nome,
                    qtdParcelas = parcelasAbertas.Count,
                    situacao = situacao,

                    valorEmAberto = parcelasAbertas.Sum(p => p.Valor),

                    proxVencimento = parcelasAbertas.Min(
                        p => p.Data_Vencimento
                    )
                };
            })
            .Where(dto => dto != null)
            .ToList()!;
    }
}// using Microsoft.EntityFrameworkCore;
// using AcessoCar.Data;
// using AcessoCar.Dtos.Financeiro;
// using System.Globalization;
// using AcessoCar.Models;
// using AcessoCar.Services.Parcelas;
// namespace AcessoCar.Services.Financeiro;

// public class FinanceiroService : IFinanceiroService
// {

//     private readonly AppDbContext _context;

//     public FinanceiroService(AppDbContext context)
//     {
//         _context = context;
//     }
//     public async Task<List<FinanceiroDTO>> ObterDados()
//     {
//         var parcelas = await _context.Parcela
//             .Where(p => p.Ativo && p.Estado != "OK" && p.aluguel != null &&
//         p.aluguel.Ativo)
//             .Include(p => p.aluguel)
//                 .ThenInclude(a => a!.cliente)
//             .ToListAsync();

//         return parcelas
//             .Where(p => p.aluguel != null && p.aluguel.cliente != null)
//             .GroupBy(p => p.aluguel!.Cliente_ID)
//             .Select(g =>
//             {
//                 var situacoes = g.Select(
//                     p => ParcelaRegras.ObterSituacao(p)
//                 ).ToList();

//                 string situacao = situacoes.Contains("ATRASADO")
//                     ? "ATRASADO"
//                     : "PENDENTE";

//                 return new FinanceiroDTO
//                 {
//                     clienteID = g.Key,
//                     clienteNome = g.First().aluguel!.cliente!.Nome,
//                     qtdParcelas = g.Count(),
//                     situacao = situacao,
//                     valorEmAberto = g.Sum(p => p.Valor),
//                     proxVencimento = g.Min(p => p.Data_Vencimento)
//                 };
//             })
//             .ToList();
//         // return await _context.Parcela
//         // .Where(p => p.Estado == "PENDENTE" || p.Estado == "ATRASADO")
//         // .GroupBy(p => p.aluguel!.Cliente_ID)
//         // .Select(g => new FinanceiroDTO
//         // {
//         //     clienteID = g.Key,
//         //     clienteNome = g.First().aluguel!.cliente!.Nome,
//         //     qtdParcelas = g.Count(),
//         //     situacao = g.Select(p => p.Estado).ToString(),
//         //     valorEmAberto = g.Sum(p => p.Valor),
//         //     proxVencimento = g.Min(p => p.Data_Vencimento)
//         // })
//         // .ToListAsync();

//     }


// }



