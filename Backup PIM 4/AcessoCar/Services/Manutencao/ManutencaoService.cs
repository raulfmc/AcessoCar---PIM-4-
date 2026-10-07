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
        .ToListAsync();
        
        return Manutencoes
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<ManutencaoRespostaDTO?> BuscarPorId(int id)
    {
        Manutencao? manutencao = await _context.Manutencao
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
            
            Descricao_Problema = dto.Descricao_Problema,
            Data_Prevista_Conclusao = dto.Data_Prevista_Conclusao,
            Ativo = dto.Ativo,
            Carro_ID = dto.Carro_ID
            
            
        };
        _context.Manutencao.Add(manutencao);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(manutencao);
    }

    public async Task<ManutencaoRespostaDTO?> Atualizar(int id, AtualizarManutencaoDTO dto)
    {
        
        Manutencao? manutencao = await _context.Manutencao
        .FirstOrDefaultAsync(Manutencao => Manutencao.ID == id);

        if (manutencao == null)
        {
            return null;
        }
        
        
        manutencao.Descricao_Problema = dto.Descricao_Problema;
        manutencao.Data_Prevista_Conclusao = dto.Data_Prevista_Conclusao;
        manutencao.Ativo = dto.Ativo;
        
        _context.Manutencao.Update(manutencao);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(manutencao);
    }
    public async Task<ManutencaoRespostaDTO?> Excluir(int id, AtualizarManutencaoDTO dto)
    {
        Manutencao? manutencao = await _context.Manutencao
        .FirstOrDefaultAsync(Manutencao => Manutencao.ID == id);

        if (manutencao is null)
        {
            return null;
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
            Descricao_Problema = manutencao.Descricao_Problema,
            Data_Prevista_Conclusao = manutencao.Data_Prevista_Conclusao,        
            carro = manutencao.carro,
            Ativo = true
           
            
        };
    }



}