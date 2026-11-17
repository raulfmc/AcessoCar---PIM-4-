namespace AcessoCar.Exceptions;
public class CarroAlugadoException : BusinessConflictException
{
    public CarroAlugadoException(string message)
        : base(message)
    {
    }
}