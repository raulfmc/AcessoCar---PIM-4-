using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
using AcessoCar.Dtos.Manutencoes;
namespace AcessoCar.Services.Manutencoes;
public class ManutencaoService : IManutencaoService
{

    private readonly AppDbContext _context;
    public ManutencaoService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<ManutencaoRespostaDTO>> Listar()
    {
        var Manutencoes = await _context.Manutencao
        .Where(manutencao => manutencao.Ativo == true)
        .Include(m => m.carro)
        .ToListAsync();
        
        return Manutencoes
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<ManutencaoRespostaDTO?> BuscarPorId(int id)
    {
        Manutencao? manutencao = await _context.Manutencao
        .Include(m => m.carro)
        .FirstOrDefaultAsync(Manutencao => Manutencao.ID == id);
        
        if (manutencao == null || manutencao.Ativo == false)
        {
            return null;
        }
       
        
        return ConverterParaResposta(manutencao);

    }
    async public Task<ManutencaoRespostaDTO?> Criar(CriarManutencaoDTO dto)
    {
        Manutencao manutencao = new Manutencao(){
            
            Descricao = dto.Descricao,
            Data_Prevista_Conclusao = dto.Data_Prevista_Conclusao,
            Valor = dto.Valor,
            Ativo = true,
            Carro_ID = dto.Carro_ID
            
        };
        _context.Manutencao.Add(manutencao);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(manutencao);
    }

    public async Task<ManutencaoRespostaDTO?> Atualizar(int id, AtualizarManutencaoDTO dto)
    {
        
        Manutencao? manutencao = await _context.Manutencao
        .Include(m => m.carro)
        .FirstOrDefaultAsync(Manutencao => Manutencao.ID == id);

        if (manutencao == null)
        {
            return null;
        }
        
        
        manutencao.Descricao = dto.Descricao;
        manutencao.Data_Prevista_Conclusao = dto.Data_Prevista_Conclusao;
        manutencao.Valor = dto.Valor;
        
        _context.Manutencao.Update(manutencao);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(manutencao);
    }
    public async Task<ManutencaoRespostaDTO?> Excluir(int id)
    {
        Manutencao? manutencao = await _context.Manutencao
        .Include(m => m.carro)
        .FirstOrDefaultAsync(Manutencao => Manutencao.ID == id);

        if (manutencao is null)
        {
            throw new KeyNotFoundException("Manutenção não encontrada");
        }
        manutencao.Ativo = false;
        _context.Manutencao.Update(manutencao);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(manutencao);
    }
    private static ManutencaoRespostaDTO ConverterParaResposta(
        Manutencao manutencao
    )
    {
        return new ManutencaoRespostaDTO
        {
            ID = manutencao.ID,
            Descricao = manutencao.Descricao,
            Data_Prevista_Conclusao = manutencao.Data_Prevista_Conclusao, 
            Valor = manutencao.Valor,       
            carro = manutencao.carro,
            Ativo = manutencao.Ativo
           
            
        };
    }



}