using AcessoCar.Dtos.Clientes;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
namespace AcessoCar.Services.Clientes;
public class ClienteService : IClienteService
{

    private readonly AppDbContext _context;
    public ClienteService(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IReadOnlyCollection<ClienteRespostaDTO>> Listar()
    {
        var Clientes = await _context.Cliente
        .Where(c => c.Ativo == true)
        .ToListAsync();
        
        return Clientes
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<ClienteRespostaDTO?> BuscarPorId(int id)
    {
        Cliente? Cliente = await _context.Cliente
        .FirstOrDefaultAsync(Cliente => Cliente.ID == id);
        
        if (Cliente == null || Cliente.Ativo == false)
        {
            return null;
        }
       
        
        return ConverterParaResposta(Cliente);

    }
    async public Task<ClienteRespostaDTO?> Criar(CriarClienteDTO dto)
    {
        Cliente Cliente = new Cliente(){
            Nome = dto.Nome,
            CPF = dto.CPF,
            Telefone = dto.Telefone,
            Email = dto.Email,
            Endereco = dto.Endereco,
            Ativo = dto.Ativo
            
        };
        _context.Cliente.Add(Cliente);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(Cliente);
    }

    public async Task<ClienteRespostaDTO?> Atualizar(int id, AtualizarClienteDTO dto)
    {
        
        Cliente? cliente = await _context.Cliente
        .FirstOrDefaultAsync(Cliente => Cliente.ID == id);

        if (cliente == null)
        {
            return null;
        }
        cliente.Nome = dto.Nome;
        cliente.CPF = dto.CPF;
        cliente.Telefone = dto.Telefone;
        cliente.Email = dto.Email;
        cliente.Endereco = dto.Endereco;
        cliente.Ativo = dto.Ativo;
        
        
        _context.Cliente.Update(cliente);
        await _context.SaveChangesAsync();
        return ConverterParaResposta(cliente);
    }
    public async Task<ClienteRespostaDTO?> Excluir(int id, AtualizarClienteDTO dto)
    {
        Cliente? Cliente = await _context.Cliente
        .FirstOrDefaultAsync(Cliente => Cliente.ID == id);

        if (Cliente is null)
        {
            return null;
        }
        Cliente.Ativo = false;
        _context.Cliente.Update(Cliente);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(Cliente);
    }
    private static ClienteRespostaDTO ConverterParaResposta(
        Cliente cliente
    )
    {
        return new ClienteRespostaDTO
        {
            ID = cliente.ID,
            Nome = cliente.Nome,
            CPF = cliente.CPF,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Endereco = cliente.Endereco,
            Ativo = true
            
        };
    }



}