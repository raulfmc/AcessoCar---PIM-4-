namespace AcessoCar.Exceptions;
public class AluguelComClienteException : BusinessConflictException
{
    public AluguelComClienteException(string message)
        : base(message)
    {
    }
}