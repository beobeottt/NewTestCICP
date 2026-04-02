using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService()
    {
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

        if (string.IsNullOrEmpty(cloudName) ||
            string.IsNullOrEmpty(apiKey) ||
            string.IsNullOrEmpty(apiSecret))
        {
            throw new Exception("❌ Cloudinary ENV missing");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new Exception("❌ File is empty");

        await using var stream = file.OpenReadStream();

        var isImage = file.ContentType.StartsWith("image/");

        UploadResult result;

        if (isImage)
        {
            // 👉 Upload IMAGE
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            result = await _cloudinary.UploadAsync(uploadParams);
        }
        else
        {
            // 👉 Upload PDF / DOCX / FILE
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = Guid.NewGuid().ToString(),
                Overwrite = false
            };

            result = await _cloudinary.UploadAsync(uploadParams);
        }

        // 👉 HANDLE ERROR
        if (result.Error != null)
        {
            Console.WriteLine("CLOUDINARY ERROR: " + result.Error.Message);
            throw new Exception(result.Error.Message);
        }

        if (result.SecureUrl == null)
        {
            throw new Exception("❌ Upload failed (no URL)");
        }

        Console.WriteLine("UPLOAD SUCCESS: " + result.SecureUrl);

        return result.SecureUrl.ToString();
    }
}