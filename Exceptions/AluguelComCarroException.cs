namespace AcessoCar.Exceptions;
public class AluguelComCarroException : BusinessConflictException
{
    public AluguelComCarroException(string message)
        : base(message)
    {
    }
}