"use client";

import { TDBCustomer } from "@/db/schema";
import {
  TDBProductWithVariantsForSale,
  TDBVariantsForSale,
} from "@/types/product";
import { produce } from "immer";
import React from "react";

type SaleFormMetadataProviderStateProps = {
  customers: TDBCustomer[] | null;
  products: TDBProductWithVariantsForSale[][] | null;
};

export type SaleFormMetadataProviderActionProps = {
  setCustomers: (customers: TDBCustomer[]) => void;
  setProducts: (product: TDBProductWithVariantsForSale[][]) => void;
  deleteProducts: (index: number) => void;
  updateProducts: (
    index: number,
    products: TDBProductWithVariantsForSale[],
  ) => void;
};

export const saleFormContext = React.createContext<
  | (SaleFormMetadataProviderStateProps & SaleFormMetadataProviderActionProps)
  | null
>(null);

export default function SaleFormMetadataProvider({
  children,
  customers,
  products,
}: {
  children: React.ReactNode;
} & Partial<SaleFormMetadataProviderStateProps>) {
  const [internal_customers, internal_setCustomers] = React.useState<
    TDBCustomer[] | null
  >(customers ?? []);
  const [internal_products, internal_setProducts] = React.useState<
    TDBProductWithVariantsForSale[][] | null
  >(products ?? []);

  const setCustomers = (customers: TDBCustomer[]) =>
    internal_setCustomers(customers);

  const updateProducts = (
    index: number,
    products: TDBProductWithVariantsForSale[],
  ) =>
    internal_setProducts(
      produce((state: TDBProductWithVariantsForSale[][] | null) => {
        if (!state) return;

        state[index] = products;
      }),
    );
  const setProducts = (products: TDBProductWithVariantsForSale[][]) =>
    internal_setProducts(products);

  const deleteProducts = (index: number) => {
    internal_setProducts(
      produce((state: TDBProductWithVariantsForSale[][] | null) => {
        if (!state) return;
        state.splice(index, 1);
      }),
    );
  };

  return (
    <saleFormContext.Provider
      value={{
        customers: internal_customers,
        products: internal_products,
        setCustomers,
        setProducts: setProducts,
        deleteProducts,
        updateProducts,
      }}
    >
      {children}
    </saleFormContext.Provider>
  );
}
