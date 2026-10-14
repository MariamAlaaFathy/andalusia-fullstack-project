using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace full_stack_project_backend.Services;

public static class StripeWebhookSignature
{
    private static readonly TimeSpan AllowedClockSkew = TimeSpan.FromMinutes(5);

    public static bool IsValid(
        string? signatureHeader,
        string payload,
        string secret,
        DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(signatureHeader) ||
            string.IsNullOrWhiteSpace(secret))
        {
            return false;
        }

        string? timestampText = null;
        var signatures = new List<string>();
        foreach (var part in signatureHeader.Split(','))
        {
            var pair = part.Split('=', 2);
            if (pair.Length != 2) continue;
            if (pair[0] == "t") timestampText = pair[1];
            if (pair[0] == "v1") signatures.Add(pair[1]);
        }

        if (!long.TryParse(
                timestampText,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var timestamp) ||
            signatures.Count == 0)
        {
            return false;
        }

        DateTimeOffset signedAt;
        try
        {
            signedAt = DateTimeOffset.FromUnixTimeSeconds(timestamp);
        }
        catch (ArgumentOutOfRangeException)
        {
            return false;
        }

        if ((now - signedAt).Duration() > AllowedClockSkew) return false;

        var signedPayload = $"{timestampText}.{payload}";
        var expectedSignature = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(secret),
            Encoding.UTF8.GetBytes(signedPayload));

        return signatures.Any(signature =>
        {
            try
            {
                var actualSignature = Convert.FromHexString(signature);
                return actualSignature.Length == expectedSignature.Length &&
                    CryptographicOperations.FixedTimeEquals(
                        expectedSignature,
                        actualSignature);
            }
            catch (FormatException)
            {
                return false;
            }
        });
    }
}
