"use server"

import { ServerActionResponse } from "@/lib/utils";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_ACCESS_KEY,
  },
});

export const getPreSignedMediaUrl = async (
  key: string,
  contentType: string,
): Promise<ServerActionResponse<{ url: string }>> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
    });

    const preSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 600,
    });

    return { url: preSignedUrl };
  } catch (error) {
    return { error: "Error generating pre-signed URL" };
  }
};

export const getSignedMediaUrl = async (
  key: string,
): Promise<ServerActionResponse<{ url: string }>> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    });

    const preSignedUrl = await getSignedUrl(client, command, {
      expiresIn: 600,
    });

    return { url: preSignedUrl };
  } catch (error) {
    return { error: "Error generating signed URL" };
  }
};
