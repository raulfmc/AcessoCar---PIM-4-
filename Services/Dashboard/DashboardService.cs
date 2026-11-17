using Microsoft.EntityFrameworkCore;
using AcessoCar.Data;
using AcessoCar.Dtos.Dashboard;
using System.Globalization;

namespace AcessoCar.Services.Dashboard;

public class DashboardService : IDashboardService
{

    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDTO> ObterDados()
    {
        var dashboard = new DashboardDTO
        {
            // FINANCEIRO
            parcelasPendentes = await _context.Parcela.CountAsync(p => p.Estado == "PENDENTE"),

            totalPendente = await _context.Parcela.Where(p => p.Estado == "PENDENTE").SumAsync(p => p.Valor),

            parcelasNaoConfirmadas = await _context.Parcela.CountAsync(p => p.Estado == "PENDENTE"),

            parcelasVencidas = await _context.Parcela.CountAsync(p => p.Estado == "ATRASADO"),

            totalAtrasado = await _context.Parcela.Where(p => p.Estado == "ATRASADO").SumAsync(p => p.Valor),

            parcelasConfirmadas = await _context.Parcela.CountAsync(p => p.Estado == "OK"),

            clientes = await _context.Cliente
            .Where(c => c.Ativo)
            .CountAsync(c => _context.Aluguel.Any(a =>
                a.Cliente_ID == c.ID &&
                _context.Parcela.Any(p =>
                p.Aluguel_ID == a.ID &&
                p.Estado == "ATRASADO"
            )
            )),

            locacoesAtivas = await _context.Aluguel
                .CountAsync(a => a.Ativo),

            // FROTA

            carrosDisponiveis = await _context.Carro
                .CountAsync(c => c.Ativo && c.Estado == "Disponível"),

            carrosLocados = await _context.Carro
                .CountAsync(c => c.Ativo && c.Estado == "Locado"),

            carrosManutencao = await _context.Carro
                .CountAsync(c => c.Ativo && c.Estado == "Manutenção"),



            pagamentoMensal = _context.Parcela
            .Where(p => p.Estado == "OK")
            .GroupBy(p => p.Data_Confirmacao.Month)
            .Select(g => new
            {
                Mes = g.Key,
                Valor = g.Sum(p => p.Valor)
            })
            .ToList()
            .OrderBy(g => g.Mes)
            .Select(g => new PagamentoMensalDTO
            {
                mes = new DateTime(2026, g.Mes, 1)
                    .ToString("MMM", new CultureInfo("pt-BR")),
                Valor = g.Valor
            })
            .ToList(),
        };

        // PAGAMENTOS MENSAIS
        // Implementar após definir a entidade de pagamentos.

        return dashboard;
    }


}