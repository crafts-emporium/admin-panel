"use client";

import { getPreSignedMediaUrl } from "@/actions/url";
import { useToast } from "./use-toast";
import { isActionError } from "@/lib/utils";
import { UploadStatus } from "@/types/upload-status";

export default function useUploadImage() {
  const { toast } = useToast();
  const [maxWidth] = [500];

  const upload = async (
    key: string,
    mimeType: string,
    file: File,
  ): Promise<UploadStatus> => {
    const resp = await getPreSignedMediaUrl(key, mimeType);

    if (isActionError(resp)) {
      toast({
        title: "Error",
        description: resp.error,
        variant: "destructive",
      });

      return "error";
    }

    try {
      await fetch(resp.url, {
        method: "PUT",
        body: file,
        headers: {
          mode: "no-cors",
        },
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      return "success";
    } catch (error) {
      toast({
        title: "Error",
        description: "Error uploading image",
        variant: "destructive",
      });

      return "error";
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const image = new Image();
    const ctx = canvas.getContext("2d")!;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        image.src = reader.result as string;

        image.onload = () => {
          canvas.width = maxWidth;
          canvas.height =
            (image.naturalWidth / image.naturalHeight) * canvas.width;

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL(file.type, "0.5");

          const byteCharacters = atob(dataUrl.split(",")[1]);
          const byteArray = new Uint8Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
          }
          //@ts-ignore
          resolve(byteArray);
        };
      };
    });
  };

  return { upload, compressImage };
}
