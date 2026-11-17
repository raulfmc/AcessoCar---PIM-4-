namespace AcessoCar.Exceptions;
public class CarroEmManutencaoException : BusinessConflictException
{
    public CarroEmManutencaoException(string message)
        : base(message)
    {
    }
}