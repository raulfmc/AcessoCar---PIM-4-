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
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using AcessoCar.Services.Dashboard;
using AcessoCar.Services.Parcelas;
using AcessoCar.Services.Financeiro;

WebApplicationBuilder builder =
WebApplication.CreateBuilder(args);

// Adiciona o suporte a controllers. 
builder.Services.AddControllers();
// Permite que o Swagger descubra os endpoints. 
builder.Services.AddEndpointsApiExplorer();
// Gera a documentação utilizada pelo Swagger. 
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));


builder.Services.AddScoped<IAdaptacaoService, AdaptacaoService>();
builder.Services.AddScoped<IAluguelService, AluguelService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<ICarroService, CarroService>();
builder.Services.AddScoped<IDividaService, DividaService>();
builder.Services.AddScoped<IManutencaoService, ManutencaoService>();
builder.Services.AddScoped<IParcelaService, ParcelaService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IFinanceiroService, FinanceiroService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services
    .AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    });
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";

    options.Cookie.Name = "AcessoCar.Antiforgery";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
builder.Services.AddAuthorization();
WebApplication app = builder.Build();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();