"use client";

import { getSignedMediaUrl } from "@/actions/products";
import { cn, isActionError } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AdvancedImage({
  className,
  src,
  imageId,
  file,
  ...props
}: Partial<ImageProps> & { imageId?: string; file?: File }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    imageId &&
      getSignedMediaUrl(imageId).then((res) => {
        if (isActionError(res)) {
          return;
        }

        setImageUrl(res.url || null);
      });
  }, [imageId]);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl((reader.result as string) || null);
    };

    reader.readAsDataURL(file);
  }, [file]);

  return (
    // @ts-ignore
    <img src={imageUrl || src} className={cn(className)} {...props} />
  );
}
