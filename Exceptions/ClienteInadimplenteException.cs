namespace AcessoCar.Exceptions;

public class ClienteInadimplenteException : BusinessConflictException
{
    public ClienteInadimplenteException(string message)
        : base(message)
    {
    }
}