"use client";

import { saleFormContext } from "@/providers/sale-form-metadata-provider";
import { useContext } from "react";

export const useSaleFormMetadata = () => {
  const saleFormMetadata = useContext(saleFormContext);

  if (!saleFormMetadata) {
    throw new Error(
      "useSaleFormMetadata must be used within a <SaleFormMetadataProvider />",
    );
  }

  return saleFormMetadata;
};

export default useSaleFormMetadata;
