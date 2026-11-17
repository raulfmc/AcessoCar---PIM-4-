namespace AcessoCar.Exceptions;

public abstract class BusinessConflictException : DomainException
{
    protected BusinessConflictException(string message)
        : base(message)
    {
    }
}