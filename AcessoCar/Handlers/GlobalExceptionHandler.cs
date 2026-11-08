using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AcessoCar.Exceptions.Handlers
{
    internal sealed class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var (statusCode, title) = exception switch
            {
                ArgumentException =>
                    (StatusCodes.Status400BadRequest, "Requisição inválida"),

                KeyNotFoundException =>
                    (StatusCodes.Status404NotFound, "Recurso não encontrado"),

                InvalidOperationException =>
                    (StatusCodes.Status409Conflict, "Conflito de negócio"),

                _ =>
                    (StatusCodes.Status500InternalServerError, "Erro do servidor")
            };

            if (statusCode == StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(exception, "Erro inesperado na aplicação.");
            }
            else
            {
                _logger.LogWarning(exception, "Exceção tratada: {Message}", exception.Message);
            }

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = statusCode == StatusCodes.Status500InternalServerError
            ? "Ocorreu um erro inesperado no servidor."
            : exception.Message
            };

            httpContext.Response.StatusCode = problemDetails.Status.Value;

            await httpContext.Response
                .WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}