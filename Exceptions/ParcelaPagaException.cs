namespace AcessoCar.Exceptions;

public class ParcelaPagaException : BusinessConflictException
{
    public ParcelaPagaException(string message)
        : base(message)
    {
    }
}