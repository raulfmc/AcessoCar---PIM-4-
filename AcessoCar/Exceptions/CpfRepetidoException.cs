namespace AcessoCar.Exceptions;

public class CpfRepetidoException : BusinessConflictException
{
    public CpfRepetidoException(string message)
        : base(message)
    {
    }
}