using AcessoCar.Dtos.Clientes;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
using AcessoCar.Exceptions;
using Microsoft.Data.SqlClient;
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
            throw new KeyNotFoundException("Cliente não encontrado");
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
            Estado = "OK",
            Ativo = true
            
        };
        try{
            _context.Cliente.Add(Cliente);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException sql &&
        sql.Number == 547 && sql.Message.Contains("UQ_Placa", StringComparison.OrdinalIgnoreCase))
        {
            throw new CpfRepetidoException("Esse CPF já existe/é inválido, insira outro CPF");
        }
        
            

        
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
    public async Task<ClienteRespostaDTO?> Excluir(int id)
    {
        Cliente? cliente = await _context.Cliente
        .FirstOrDefaultAsync(Cliente => Cliente.ID == id);

        if (cliente is null)
        {
            return null;
        }
        cliente.Ativo = false;
        
        _context.Cliente.Update(cliente);
        await _context.SaveChangesAsync();

        return ConverterParaResposta(cliente);
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
            Estado = cliente.Estado,
            Ativo = cliente.Ativo

            
        };
    }



}