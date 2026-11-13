using AcessoCar.Dtos.Dividas;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
namespace AcessoCar.Services.Dividas;

public class DividaService : IDividaService
{

    private readonly AppDbContext _context;
    public DividaService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<DividaRespostaDTO>> Listar()
    {
        var Dividas = await _context.Divida
        .Include(d => d.aluguel)
            .ThenInclude(a => a!.carro)
        .Include(d => d.aluguel)
            .ThenInclude(a => a!.cliente)
        .Where(c => c.Ativo == true)
        .ToListAsync();

        return Dividas
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<DividaRespostaDTO?> BuscarPorId(int id)
    {
        Divida? Divida = await _context.Divida
        .FirstOrDefaultAsync(Divida => Divida.ID == id);

        if (Divida == null || Divida.Ativo == false)
        {
            throw new KeyNotFoundException("Dívida não encontrada");
        }


        return ConverterParaResposta(Divida);

    }
    async public Task<DividaRespostaDTO?> Criar(CriarDividaDTO dto)
    {
        Aluguel? aluguel = await _context.Aluguel
        .FirstOrDefaultAsync(a => a.ID == dto.Aluguel_ID);
        if (aluguel is null)
            throw new KeyNotFoundException("Aluguel não encontrado.");
        decimal valor = decimal.Round(dto.Valor, 2,
         MidpointRounding.AwayFromZero);
        if (valor <= 0 || valor > 99999999999999.99m)
            throw new ArgumentException("Valor da dívida inválido.");
        Divida divida = new Divida()
        {

            Data_Criacao = dto.Data_Criacao,
            Tipo = dto.Tipo,
            Descricao = dto.Descricao,
            Valor = valor,
            Aluguel_ID = dto.Aluguel_ID,
            Ativo = true


        };
        _context.Divida.Add(divida);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(divida);
    }

    public async Task<DividaRespostaDTO?> Atualizar(int id, AtualizarDividaDTO dto)
    {

        Divida? Divida = await _context.Divida
        .FirstOrDefaultAsync(Divida => Divida.ID == id);

        if (Divida == null)
        {
            return null;
        }
        decimal valor = decimal.Round(dto.Valor, 2,
        MidpointRounding.AwayFromZero);

        Divida.Data_Criacao = dto.Data_Criacao;
        Divida.Tipo = dto.Tipo;
        Divida.Valor = valor;
        Divida.Descricao = dto.Descricao;

        _context.Divida.Update(Divida);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(Divida);
    }
    public async Task<DividaRespostaDTO?> Excluir(int id)
    {
        Divida? divida = await _context.Divida
        .FirstOrDefaultAsync(Divida => Divida.ID == id);

        if (divida is null)
        {
            return null;
        }
        divida.Ativo = false;
        _context.Divida.Update(divida);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(divida);
    }
    private static DividaRespostaDTO ConverterParaResposta(
        Divida divida
    )
    {
        return new DividaRespostaDTO
        {
            ID = divida.ID,
            Data_Criacao = divida.Data_Criacao,
            Tipo = divida.Tipo,
            Descricao = divida.Descricao,
            Valor = divida.Valor,
            Aluguel_ID = divida.Aluguel_ID,
            Ativo = divida.Ativo


        };
    }



}