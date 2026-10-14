namespace Assignment_3.Middleware;

public sealed class PaymentGatewayException(string message, Exception innerException)
    : Exception(message, innerException);
