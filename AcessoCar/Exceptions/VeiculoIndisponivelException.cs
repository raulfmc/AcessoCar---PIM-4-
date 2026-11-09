namespace AcessoCar.Exceptions;
public class VeiculoIndisponivelException : BusinessConflictException
{
    public VeiculoIndisponivelException(string message)
        : base(message)
    {
    }
}