using Microsoft.EntityFrameworkCore;
using AcessoCar.Models;

namespace AcessoCar.Data;

public class AppDbContext : DbContext
{

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {

    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Carro>()
            .Property(c => c.Valor_Diaria)
            .HasPrecision(16, 2);
        modelBuilder.Entity<Aluguel>()
            .Property(a => a.Valor_Total)
            .HasPrecision(16, 2);
        modelBuilder.Entity<Divida>()
            .Property(d => d.Valor)
            .HasPrecision(16, 2);
        modelBuilder.Entity<Aluguel>()
            .ToTable("Aluguel", tb => tb.HasTrigger("AtualizarQtdAlugueis"));
    }
    public DbSet<Carro> Carro { get; set; }
    public DbSet<Cliente> Cliente { get; set; }
    public DbSet<Divida> Divida { get; set; }
    public DbSet<Manutencao> Manutencao { get; set; }
    public DbSet<Aluguel> Aluguel { get; set; }
    public DbSet<Adaptacao> Adaptacao { get; set; }
}


