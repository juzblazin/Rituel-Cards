import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 object storage.
 *
 * R2 speaks the S3 API, so requests are signed with SigV4. `aws4fetch` is used
 * instead of `@aws-sdk/client-s3` because it is fetch-based (no Node built-ins,
 * so it survives bundling for workerd) and is a fraction of the size.
 *
 * Two ways to get a file in:
 *   - `createUploadUrl()` returns a presigned PUT URL, so the browser uploads
 *     straight to R2 and the bytes never pass through a serverless function.
 *     This is the right choice for card artwork. Requires a CORS policy on the
 *     bucket listing the app origin, and the browser must send the same
 *     `Content-Type` that was signed.
 *   - `putObject()` uploads server-side, for small or already-validated files.
 *
 * With no R2 variables set, `isStorageConfigured()` is false and the helpers
 * throw rather than signing with empty credentials.
 */

const accountId = process.env.R2_ACCOUNT_ID?.trim() || "";
const bucket = process.env.R2_BUCKET_NAME?.trim() || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() || "";
const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL?.trim() || "").replace(/\/+$/, "");

/** Presigned URLs and direct uploads both cap out here; issuer artwork is far smaller. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
] as const;

export function isStorageConfigured(): boolean {
  return Boolean(accountId && bucket && accessKeyId && secretAccessKey);
}

let client: AwsClient | null = null;

function getClient(): AwsClient {
  if (!isStorageConfigured()) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.",
    );
  }
  // R2 ignores region but SigV4 requires one; "auto" is Cloudflare's convention.
  client ??= new AwsClient({ service: "s3", region: "auto", accessKeyId, secretAccessKey });
  return client;
}

/** Percent-encode each path segment but keep the `/` separators meaningful. */
function encodeKey(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

function objectUrl(key: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodeKey(key)}`;
}

/** Public bucket/CDN URL for a key, or `null` when no public base URL is configured. */
export function publicUrl(key: string): string | null {
  if (!publicBaseUrl) return null;
  return `${publicBaseUrl}/${encodeKey(key)}`;
}

export function isAllowedContentType(contentType: string): boolean {
  return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(contentType);
}

/** Upload server-side. Use `createUploadUrl` instead when the file is large. */
export async function putObject(
  key: string,
  body: ArrayBuffer | Uint8Array | Blob | string,
  contentType: string,
): Promise<{ key: string; url: string | null }> {
  if (!isAllowedContentType(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const response = await getClient().fetch(objectUrl(key), {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: body as BodyInit,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed (${response.status}): ${await response.text().catch(() => "")}`);
  }

  return { key, url: publicUrl(key) };
}

export async function deleteObject(key: string): Promise<void> {
  const response = await getClient().fetch(objectUrl(key), { method: "DELETE" });
  // 404 means the object is already gone, which is the desired end state.
  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete failed (${response.status}): ${await response.text().catch(() => "")}`);
  }
}

/**
 * Presigned PUT URL for a direct browser upload. R2 accepts 1 second to 7 days;
 * keep it as short as the upload allows, since the URL is a bearer token.
 */
export async function createUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 900,
): Promise<{ key: string; uploadUrl: string; publicUrl: string | null }> {
  if (!isAllowedContentType(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const signed = await getClient().sign(
    new Request(`${objectUrl(key)}?X-Amz-Expires=${expiresInSeconds}`, {
      method: "PUT",
      headers: { "Content-Type": contentType },
    }),
    { aws: { signQuery: true, allHeaders: true } },
  );

  return { key, uploadUrl: signed.url.toString(), publicUrl: publicUrl(key) };
}

/** Presigned GET URL, for private objects that should not be publicly readable. */
export async function createDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
  const signed = await getClient().sign(new Request(`${objectUrl(key)}?X-Amz-Expires=${expiresInSeconds}`), {
    aws: { signQuery: true },
  });
  return signed.url.toString();
}
