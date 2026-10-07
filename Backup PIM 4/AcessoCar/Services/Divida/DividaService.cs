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
            return null;
        }
       
        
        return ConverterParaResposta(Divida);

    }
    async public Task<DividaRespostaDTO?> Criar(CriarDividaDTO dto)
    {
        Aluguel? aluguel = await _context.Aluguel
        .FirstOrDefaultAsync(a => a.ID == dto.Aluguel_ID);
        Divida divida = new Divida(){

            Data_Criacao = dto.Data_Criacao,
            Tipo = dto.Tipo,
            Descricao = dto.Descricao,
            Aluguel_ID = dto.Aluguel_ID,
            Ativo = dto.Ativo
            
            
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
        
        
        Divida.Data_Criacao = dto.Data_Criacao;
        Divida.Tipo = dto.Tipo;
        Divida.Descricao = dto.Descricao;
        
        _context.Divida.Update(Divida);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(Divida);
    }
    public async Task<DividaRespostaDTO?> Excluir(int id, AtualizarDividaDTO dto)
    {
        Divida? Divida = await _context.Divida
        .FirstOrDefaultAsync(Divida => Divida.ID == id);

        if (Divida is null)
        {
            return null;
        }
        Divida.Ativo = false;
        _context.Divida.Update(Divida);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(Divida);
    }
    private static DividaRespostaDTO ConverterParaResposta(
        Divida Divida
    )
    {
        return new DividaRespostaDTO
        {
            ID = Divida.ID,
            Data_Criacao = Divida.Data_Criacao,
            Tipo = Divida.Tipo,
            Descricao = Divida.Descricao,
            Valor = Divida.Valor,
            Aluguel_ID = Divida.Aluguel_ID,
            Ativo = true
           
            
        };
    }



}