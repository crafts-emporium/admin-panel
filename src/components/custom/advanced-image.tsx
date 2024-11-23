"use client";

import { getSignedMediaUrl } from "@/actions/url";
import { cn, isActionError } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import fallback from "@/../public/fallback.jpg";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export default function AdvancedImage({
  className,
  src,
  imageId,
  file,
  ...props
}: Partial<ImageProps> & { imageId?: string; file?: File }) {
  const [imageUrl, setImageUrl] = useState<string | StaticImport | null>(
    src || null,
  );

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
    <Image
      src={imageUrl || fallback}
      className={cn(className)}
      {...props}
      onError={() => setImageUrl(fallback)}
    />
  );
}
