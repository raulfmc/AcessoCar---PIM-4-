namespace AcessoCar.Exceptions;

public class PlacaRepetidaException : BusinessConflictException
{
    public PlacaRepetidaException(string message)
        : base(message)
    {
    }
}