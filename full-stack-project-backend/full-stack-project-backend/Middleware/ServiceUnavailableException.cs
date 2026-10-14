namespace Assignment_3.Middleware;

public sealed class ServiceUnavailableException(
    string message,
    Exception? innerException = null) : Exception(message, innerException);
