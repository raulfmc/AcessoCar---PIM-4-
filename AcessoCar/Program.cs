using AcessoCar.Services;
using AcessoCar.Services.Adaptacoes;
using Microsoft.EntityFrameworkCore;
using AcessoCar.Data;
using AcessoCar.Services.Carros;
using AcessoCar.Services.Clientes;
using AcessoCar.Services.Dividas;
using AcessoCar.Services.Manutencoes;
using AcessoCar.Services.Alugueis;
using AcessoCar.Exceptions.Handlers;

WebApplicationBuilder builder =
WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("LiberarFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
// Adiciona o suporte a controllers. 
builder.Services.AddControllers();
// Permite que o Swagger descubra os endpoints. 
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));
// Gera a documentação utilizada pelo Swagger. 
builder.Services.AddSwaggerGen();
// Quando alguém solicitar IProdutoService, 
// o ASP.NET Core fornecerá ProdutoService. 
builder.Services.AddScoped<IAdaptacaoService, AdaptacaoService>();
builder.Services.AddScoped<IAluguelService, AluguelService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<ICarroService, CarroService>();
builder.Services.AddScoped<IDividaService, DividaService>();
builder.Services.AddScoped<IManutencaoService, ManutencaoService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
WebApplication app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseCors("LiberarFrontend");
app.MapControllers();
app.Run();