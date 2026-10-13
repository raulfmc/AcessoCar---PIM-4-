using AcessoCar.Dtos.Carros;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
namespace AcessoCar.Services.Carros;
public class CarroService : ICarroService
{

    private readonly AppDbContext _context;
    public CarroService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<CarroRespostaDTO>> Listar()
    {
        var Carros = await _context.Carro
        .Where(c => c.Ativo == true)
        .ToListAsync();
        
        return Carros
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<CarroRespostaDTO?> BuscarPorId(int id)
    {
        Carro? Carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);
        
        if (Carro == null || Carro.Ativo == false)
        {
            return null;
        }
       
        
        return ConverterParaResposta(Carro);

    }
    async public Task<CarroRespostaDTO?> Criar(CriarCarroDTO dto)
    {
        Carro carro = new Carro(){
            Marca = dto.Marca,
            Modelo = dto.Modelo,
            Ano_Fabricacao = dto.Ano_Fabricacao,
            Numero = dto.Numero,
            Versao = dto.Versao,
            Cambio = dto.Cambio,
            Placa = dto.Placa,
            Cor = dto.Cor,
            Estado = dto.Estado,
            Valor_Diaria = dto.Valor_Diaria,
            Ativo = dto.Ativo
            
        };
        _context.Carro.Add(carro);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(carro);
    }

    public async Task<CarroRespostaDTO?> Atualizar(int id, AtualizarCarroDTO dto)
    {
        
        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (carro == null)
        {
            return null;
        }

        
        carro.Marca = dto.Marca;
        carro.Modelo = dto.Modelo;
        carro.Ano_Fabricacao = dto.Ano_Fabricacao;
        carro.Numero = dto.Numero;
        carro.Versao = dto.Versao;
        carro.Cambio = dto.Cambio;
        carro.Placa = dto.Placa;
        carro.Cor = dto.Cor;
        carro.Estado = dto.Estado;
        carro.Valor_Diaria = dto.Valor_Diaria;
        _context.Carro.Update(carro);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(carro);
    }
    public async Task<CarroRespostaDTO?> Excluir(int id, AtualizarCarroDTO dto)
    {
        Carro? carro = await _context.Carro
        .FirstOrDefaultAsync(Carro => Carro.ID == id);

        if (carro is null)
        {
            return null;
        }
        carro.Ativo = false;
        _context.Carro.Update(carro);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(carro);
    }
    private static CarroRespostaDTO ConverterParaResposta(
        Carro carro
    )
    {
        return new CarroRespostaDTO
        {
            ID = carro.ID,
            Marca = carro.Marca,
            Modelo = carro.Modelo,
            Ano_Fabricacao = carro.Ano_Fabricacao,
            Numero = carro.Numero,
            Versao = carro.Versao,
            Cambio = carro.Cambio,
            Placa = carro.Placa,
            Cor = carro.Cor,
            Estado = carro.Estado,
            Valor_Diaria = carro.Valor_Diaria,
            Ativo = true
            
        };
    }



}