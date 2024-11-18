"use client";

import { getPreSignedMediaUrl } from "@/actions/products";
import { useToast } from "./use-toast";
import { isActionError } from "@/lib/utils";
import { UploadStatus } from "@/types/upload-status";

export default function useUploadImage() {
  const { toast } = useToast();

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

  return { upload };
}
