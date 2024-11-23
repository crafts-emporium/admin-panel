"use client";

import { TDBCustomer } from "@/db/schema";
import { TDBVariantWithProduct } from "@/types/product";
import { produce } from "immer";
import React from "react";

type SaleFormMetadataProviderStateProps = {
  customers: TDBCustomer[] | null;
  variants: TDBVariantWithProduct[][] | null;
};

export type SaleFormMetadataProviderActionProps = {
  setCustomers: (customers: TDBCustomer[]) => void;
  updateVariants: (variants: TDBVariantWithProduct[], index: number) => void;
  setVariants: (variants: TDBVariantWithProduct[][]) => void;
  deleteVariants: (index: number) => void;
};

export const saleFormContext = React.createContext<
  | (SaleFormMetadataProviderStateProps & SaleFormMetadataProviderActionProps)
  | null
>(null);

export default function SaleFormMetadataProvider({
  children,
  customers,
  variants,
}: {
  children: React.ReactNode;
} & Partial<SaleFormMetadataProviderStateProps>) {
  const [internal_customers, internal_setCustomers] = React.useState<
    TDBCustomer[] | null
  >(customers ?? []);
  const [internal_variants, internal_setVariants] = React.useState<
    TDBVariantWithProduct[][] | null
  >(variants ?? []);

  const setCustomers = (customers: TDBCustomer[]) =>
    internal_setCustomers(customers);

  const updateVariants = (variants: TDBVariantWithProduct[], index: number) =>
    internal_setVariants(
      produce((state: TDBVariantWithProduct[][] | null) => {
        if (!state) return;

        state[index] = variants;
      }),
    );
  const setVariants = (variants: TDBVariantWithProduct[][]) =>
    internal_setVariants(variants);

  const deleteVariants = (index: number) => {
    internal_setVariants(
      produce((state: TDBVariantWithProduct[][] | null) => {
        if (!state) return;
        state.splice(index, 1);
      }),
    );
  };

  return (
    <saleFormContext.Provider
      value={{
        customers: internal_customers,
        variants: internal_variants,
        setCustomers,
        updateVariants,
        setVariants,
        deleteVariants,
      }}
    >
      {children}
    </saleFormContext.Provider>
  );
}
