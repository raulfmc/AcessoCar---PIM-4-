namespace AcessoCar.Exceptions;

public class ClienteDevedorException : BusinessConflictException
{
    public ClienteDevedorException(string message)
        : base(message)
    {
    }
}