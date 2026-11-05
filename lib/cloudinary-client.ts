export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  originalFilename: string;
  format: string;
  bytes: number;
}

/**
 * Upload a file directly from the browser to Cloudinary using signed authentication.
 * The file stream never passes through Next.js or Vercel serverless functions,
 * completely bypassing Vercel's 4.5 MB request body limit and timeouts.
 */
export async function uploadDirectToCloudinary(
  file: File,
  type: "pdf" | "image",
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  // 1. Request signed parameters from our Next.js backend (tiny JSON payload)
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      filename: file.name,
    }),
  });

  if (!signRes.ok) {
    const errorJson = await signRes.json().catch(() => null);
    throw new Error(
      errorJson?.error || `Failed to get upload signature (status ${signRes.status})`
    );
  }

  const { data: signData } = await signRes.json();

  if (!signData || !signData.signature || !signData.uploadUrl) {
    throw new Error("Invalid signature response from server");
  }

  // 2. Build FormData with the signed parameters
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", signData.timestamp.toString());
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);
  formData.append("public_id", signData.publicId);

  // 3. Perform direct browser-to-Cloudinary upload
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signData.uploadUrl, true);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.url,
            secureUrl: response.secure_url,
            publicId: response.public_id,
            originalFilename: response.original_filename,
            format: response.format,
            bytes: response.bytes,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse?.error?.message ||
                `Cloudinary upload failed with status ${xhr.status}`
            )
          );
        } catch {
          reject(
            new Error(
              `Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during direct Cloudinary upload"));
    };

    xhr.send(formData);
  });
}

