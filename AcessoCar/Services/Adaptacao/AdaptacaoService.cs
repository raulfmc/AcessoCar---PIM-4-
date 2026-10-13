using AcessoCar.Dtos.Adaptacoes;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
namespace AcessoCar.Services.Adaptacoes;

public class AdaptacaoService : IAdaptacaoService
{

    private readonly AppDbContext _context;
    public AdaptacaoService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<AdaptacaoRespostaDTO>> Listar()
    {
        var Adaptacoes = await _context.Adaptacao
        .Include(a => a.carro)
        .Where(a => a.Ativo == true)
        .ToListAsync();

        return Adaptacoes
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<AdaptacaoRespostaDTO?> BuscarPorId(int id)
    {
        Adaptacao? adaptacao = await _context.Adaptacao
        .Include(a => a.carro)
        .FirstOrDefaultAsync(Adaptacao => Adaptacao.ID == id);

        if (adaptacao == null || adaptacao.Ativo == false)
        {
            return null;
        }


        return ConverterParaResposta(adaptacao);

    }
    async public Task<AdaptacaoRespostaDTO?> Criar(CriarAdaptacaoDTO dto)
    {
        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(c => c.ID == dto.Carro_ID);

        if (carro == null)
        {
            return null;
        }

        Adaptacao adaptacao = new Adaptacao()
        {
            Nome = dto.Nome,
            Tipo = dto.Tipo,
            Descricao = dto.Descricao,
            Carro_ID = dto.Carro_ID,
            carro = carro,
            Ativo = dto.Ativo
        };
        _context.Adaptacao.Add(adaptacao);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(adaptacao);
    }

    public async Task<AdaptacaoRespostaDTO?> Atualizar(int id, AtualizarAdaptacaoDTO dto)
    {

        Adaptacao? adaptacao = await _context.Adaptacao
        .Include(Adaptacao => Adaptacao.carro)
        .FirstOrDefaultAsync(Adaptacao => Adaptacao.ID == id);

        if (adaptacao == null)
        {
            return null;
        }

        adaptacao.Nome = dto.Nome;
        adaptacao.Tipo = dto.Tipo;
        adaptacao.Descricao = dto.Descricao;
        await _context.SaveChangesAsync();
        return ConverterParaResposta(adaptacao);
    }
    public async Task<AdaptacaoRespostaDTO?> Excluir(int id, AtualizarAdaptacaoDTO dto)
    {
        Adaptacao? adaptacao = await _context.Adaptacao
        .Include(Adaptacao => Adaptacao.carro)
        .FirstOrDefaultAsync(Adaptacao => Adaptacao.ID == id);

        if (adaptacao is null)
        {
            return null;
        }
        adaptacao.Ativo = false;
        await _context.SaveChangesAsync();

        return ConverterParaResposta(adaptacao);
    }
    private static AdaptacaoRespostaDTO ConverterParaResposta(
        Adaptacao adaptacao
    )
    {
        return new AdaptacaoRespostaDTO
        {
            ID = adaptacao.ID,
            Nome = adaptacao.Nome,
            Tipo = adaptacao.Tipo,
            Descricao = adaptacao.Descricao,
            Carro_ID = adaptacao.Carro_ID,
            carro = adaptacao.carro,
            Ativo = true

        };
    }



}