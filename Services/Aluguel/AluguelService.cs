using AcessoCar.Dtos.Alugueis;
using AcessoCar.Data;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;
using System.Data;
using AcessoCar.Exceptions;
using AcessoCar.Services.Parcelas;
using AcessoCar.Dtos.Parcelas;
using AcessoCar.Services.Clientes;
using AcessoCar.Services.Carros;

namespace AcessoCar.Services.Alugueis;

public class AluguelService : IAluguelService
{

    private readonly AppDbContext _context;

    private readonly IParcelaService _parcelaService;
    private readonly IClienteService _clienteService;

    private readonly ICarroService _carroService;

    public AluguelService(
        AppDbContext context,
        IParcelaService parcelaService, IClienteService clienteService,
        ICarroService carroService)
    {
        _context = context;
        _parcelaService = parcelaService;
        _clienteService = clienteService;
        _carroService = carroService;
    }
    public async Task<IReadOnlyCollection<AluguelRespostaDTO>> Listar()
    {
        var alugueis = await _context.Aluguel
        .Include(Aluguel => Aluguel.carro)
        .Include(Aluguel => Aluguel.cliente)
        .Include(Aluguel => Aluguel.ParcelasDetalhes)
        .Where(Aluguel => Aluguel.Ativo == true)
        .ToListAsync();

        return alugueis
        .Select(ConverterParaResposta)
        .ToList();


    }

    async public Task<AluguelRespostaDTO?> BuscarPorId(int ID)
    {
        Aluguel? aluguel = await _context.Aluguel
        .Include(aluguel => aluguel.carro)
        .Include(aluguel => aluguel.cliente)
        .Include(aluguel => aluguel.ParcelasDetalhes)
        .FirstOrDefaultAsync(aluguel => aluguel.ID == ID);

        if (aluguel == null || aluguel.Ativo == false)
        {
            throw new KeyNotFoundException("Aluguel não encontrado");
        }


        return ConverterParaResposta(aluguel);

    }
    async public Task<AluguelRespostaDTO?> Criar(CriarAluguelDTO dto)

    {
        if (dto.Parcelas <= 0)
            throw new ArgumentException(
                "A quantidade de parcelas deve ser maior que zero."
            );

        if (dto.Data_Inicio >= dto.Data_Fim)
            throw new ArgumentException(
                "A data de início deve ser anterior à data de término."
            );

        await using var transacao = await _context.Database
        .BeginTransactionAsync(IsolationLevel.Serializable);
        try
        {
            bool alugado = await _context.Aluguel.AnyAsync(a =>
            a.Carro_ID == dto.Carro_ID &&
            a.Ativo &&
            a.Data_Inicio < dto.Data_Fim &&
            a.Data_Fim > dto.Data_Inicio
            );

            Carro? carro = await _context.Carro
            .FirstOrDefaultAsync(c => dto.Carro_ID == c.ID);

            if (carro == null)
            {
                throw new KeyNotFoundException($"Carro não encontrado");
            }

            Cliente? cliente = await _context.Cliente
            .FirstOrDefaultAsync(c => dto.Cliente_ID == c.ID);

            if (cliente == null)
            {
                throw new KeyNotFoundException($"Cliente não encontrado");
            }

            string estadoCliente = await _clienteService.CalcularEstado(cliente.ID);

            if (estadoCliente == "ATRASADO")
            {
                throw new ClienteInadimplenteException(
                    "Cliente possui parcelas atrasadas e não pode realizar uma nova locação."
                );
            }
            string estadoCarro = await _carroService.CalcularEstado(carro.ID);

            if (estadoCarro == "EM MANUTENÇÃO")
            {
                throw new CarroEmManutencaoException(
                    "Carro não pode ser alugado, está em manutenção."
                );
            }
            if (alugado)
            {
                throw new CarroAlugadoException("Já há uma locação nesse período para esse carro");
            }
            DateTime inicio = dto.Data_Inicio.Date;
            DateTime fim = dto.Data_Fim.Date;

            Aluguel Aluguel = new Aluguel()
            {
                Data_Inicio = dto.Data_Inicio,
                Data_Fim = dto.Data_Fim,
                Carro_ID = dto.Carro_ID,
                Valor_Total = dto.Valor_Total,
                Forma_Pagamento = dto.Forma_Pagamento,
                Primeiro_Vencimento = dto.Primeiro_Vencimento,
                Parcelas = dto.Parcelas,
                Estado = "OK",
                Ativo = true,
                Cliente_ID = dto.Cliente_ID,
                carro = carro,
                cliente = cliente
            };
            _context.Aluguel.Add(Aluguel);

            await _context.SaveChangesAsync();


            // var parcelasGeradas = new List<Parcela>();

            decimal valorParcela = Math.Round(
                dto.Valor_Total / dto.Parcelas, 2
            );

            for (int i = 0; i < dto.Parcelas; i++)
            {
                DateTime vencimento = dto.Primeiro_Vencimento.AddMonths(i);


                decimal valor = i == dto.Parcelas - 1
                    ? dto.Valor_Total - (valorParcela * (dto.Parcelas - 1))
                    : valorParcela;

                await _parcelaService.Criar(new CriarParcelaDTO
                {
                    Aluguel_ID = Aluguel.ID,
                    Valor = valor,
                    Data_Vencimento = vencimento,
                    Data_Confirmacao = null,
                    Numero = i + 1,
                    Estado = "PENDENTE"
                });
            }

            // _context.Parcela.AddRange(parcelasGeradas);
            await _context.Entry(carro).ReloadAsync();
            await transacao.CommitAsync();
            return ConverterParaResposta(Aluguel);
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }
    }

    public async Task<AluguelRespostaDTO?> Atualizar(int id, AtualizarAluguelDTO dto)
    {
        Aluguel? aluguel = await _context.Aluguel
        .Include(aluguel => aluguel.ParcelasDetalhes)
        .FirstOrDefaultAsync(Aluguel => Aluguel.ID == id);

        if (aluguel == null)
        {
            return null;
        }
        if (aluguel.ParcelasDetalhes.Any(p => p.Estado == "OK"))
        {
            throw new ParcelaPagaException(
                "Não é possível alterar uma locação que possui parcelas pagas."
            );
        }
        Console.WriteLine($"Quantidade de parcelas: {aluguel.ParcelasDetalhes.Count}");

        foreach (var parcela in aluguel.ParcelasDetalhes)
        {
            Console.WriteLine($"Estado: {parcela.Estado}");
        }
        aluguel.Data_Inicio = dto.Data_Inicio;
        aluguel.Data_Fim = dto.Data_Fim;
        aluguel.Valor_Total = dto.Valor_Total;

        List<Parcela> parcelas = aluguel.ParcelasDetalhes.ToList();
        int quantidadeParcelas = aluguel.ParcelasDetalhes.Count;

        if (quantidadeParcelas > 0)
        {
            decimal valorParcela = Math.Round(
            dto.Valor_Total / quantidadeParcelas,
            2,
            MidpointRounding.AwayFromZero
        );

            decimal valorDistribuido = 0;

            for (int i = 0; i < quantidadeParcelas; i++)
            {
                if (i == quantidadeParcelas - 1)
                {
                    parcelas[i].Valor = dto.Valor_Total - valorDistribuido;
                }
                else
                {
                    parcelas[i].Valor = valorParcela;
                    valorDistribuido += valorParcela;
                }
            }

        }
        await _context.SaveChangesAsync();
        return ConverterParaResposta(aluguel);

    }
    public async Task<AluguelRespostaDTO?> Excluir(int id)
    {
        Aluguel? aluguel = await _context.Aluguel
        .Include(Aluguel => Aluguel.carro)
        .Include(Aluguel => Aluguel.ParcelasDetalhes)
        .FirstOrDefaultAsync(Aluguel => Aluguel.ID == id);

        if (aluguel is null)
        {
            return null;
        }
        aluguel.Ativo = false;
        await _context.SaveChangesAsync();

        return ConverterParaResposta(aluguel);
    }
    public async Task<string> CalcularEstado(int aluguelId)
    {
        DateTime hoje = DateTime.Today;

        bool atrasado = await _context.Parcela.AnyAsync(p =>
            p.Aluguel_ID == aluguelId &&
            p.Data_Confirmacao == null &&
            p.Data_Vencimento.Date < hoje
        );

        if (atrasado)
            return "ATRASADO";

        bool pendente = await _context.Parcela.AnyAsync(p =>
            p.Aluguel_ID == aluguelId &&
            p.Data_Confirmacao == null &&
            p.Data_Vencimento.Date >= hoje
        );

        if (pendente)
            return "PENDENTE";

        return "OK";
    }
    private static AluguelRespostaDTO ConverterParaResposta(
        Aluguel aluguel
    )
    {
        // Console.WriteLine($"Aluguel ID: {aluguel.ID}");
        // Console.WriteLine($"Quantidade de parcelas: {aluguel.ParcelasDetalhes?.Count}");

        foreach (var parcela in aluguel.ParcelasDetalhes ?? new List<Parcela>())
        {
            Console.WriteLine(
                $"Parcela: {parcela.ID} | " +
                $"Estado: {parcela.Estado} | " +
                $"Vencimento: {parcela.Data_Vencimento} | " +
                $"Pagamento: {parcela.Data_Confirmacao}"
            );
        }
        return new AluguelRespostaDTO
        {
            ID = aluguel.ID,
            Data_Inicio = aluguel.Data_Inicio,
            Data_Fim = aluguel.Data_Fim,
            Valor_Total = aluguel.Valor_Total,
            Forma_Pagamento = aluguel.Forma_Pagamento,
            Parcelas = aluguel.Parcelas,
            Estado = StatusFinanceiro.Calcular(aluguel.ParcelasDetalhes),
            Primeiro_Vencimento = aluguel.Primeiro_Vencimento,
            Carro_ID = aluguel.Carro_ID,
            Cliente_ID = aluguel.Cliente_ID,
            carro = aluguel.carro,
            cliente = aluguel.cliente,
            Ativo = aluguel.Ativo

        };
    }



}