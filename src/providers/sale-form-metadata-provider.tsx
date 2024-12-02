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
  selectedProducts: TDBProductWithVariantsForSale[] | null;
};

export type SaleFormMetadataProviderActionProps = {
  setCustomers: (customers: TDBCustomer[]) => void;
  setProducts: (product: TDBProductWithVariantsForSale[][]) => void;
  deleteProducts: (index: number) => void;
  updateProducts: (
    index: number,
    products: TDBProductWithVariantsForSale[],
  ) => void;
  setSelectedProducts: (products: TDBProductWithVariantsForSale[]) => void;
  updateSelectedProduct: (
    index: number,
    product: TDBProductWithVariantsForSale,
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
  selectedProducts,
}: {
  children: React.ReactNode;
} & Partial<SaleFormMetadataProviderStateProps>) {
  const [internal_customers, internal_setCustomers] = React.useState<
    TDBCustomer[]
  >(customers ?? []);
  const [internal_products, internal_setProducts] = React.useState<
    TDBProductWithVariantsForSale[][]
  >(products ?? []);
  const [internal_selectedProducts, internal_setSelectedProducts] =
    React.useState<TDBProductWithVariantsForSale[]>(selectedProducts ?? []);

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

  const setSelectedProducts = (products: TDBProductWithVariantsForSale[]) => {
    internal_setSelectedProducts(products);
  };

  const updateSelectedProduct = (
    index: number,
    product: TDBProductWithVariantsForSale,
  ) => {
    internal_setSelectedProducts(
      produce((state: TDBProductWithVariantsForSale[] | null) => {
        if (!state) return;
        state[index] = product;
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
        selectedProducts: internal_selectedProducts,
        setSelectedProducts,
        updateSelectedProduct,
      }}
    >
      {children}
    </saleFormContext.Provider>
  );
}
