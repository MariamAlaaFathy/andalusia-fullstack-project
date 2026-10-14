namespace Assignment_3.Middleware;

public sealed class RequestValidationException(string message) : Exception(message);
