"use client";

import { getCustomers } from "@/actions/customer";
import { getProductWithVariants } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  SearchCombo,
  SearchComboContent,
  SearchComboEmpty,
  SearchComboInput,
  SearchComboList,
  SearchComboListItem,
  SearchComboListItemDescription,
  SearchComboListItemTitle,
  SearchComboTrigger,
} from "@/components/ui/search-combo";
import { TDBCustomer } from "@/db/schema";
import { cn, isActionError } from "@/lib/utils";
import { getSaleItemDefault, TSale } from "@/schema/sale";
import { TDBProductWithVariantsForSale } from "@/types/product";
import { PopoverClose } from "@radix-ui/react-popover";
import {
  ChevronDown,
  Dot,
  IndianRupee,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import AdvancedImage from "../advanced-image";
import useSaleFormMetadata from "@/hooks/use-sale-form-metadata";
import { Input } from "@/components/ui/input";
import React, { useEffect } from "react";
import InputWithPrefixNode from "@/components/ui/input-with-prefixnode";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/functions/format-number";

export default function SaleForm({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<TSale>>;
  onSubmit: (e: TSale) => void;
}) {
  const {
    customers,
    products,
    setCustomers,
    updateProducts,
    deleteProducts,
    selectedProducts,
    updateSelectedProduct,
  } = useSaleFormMetadata();
  const items = useFieldArray({
    control: form.control,
    name: "saleItems",
  });
  const customerDetails = customers?.find(
    (item) => item.id.toString() === form.watch("customerId"),
  );
  const productDetails = (id: string) => {
    return selectedProducts?.find((item) => item.id.toString() === id);
  };

  const variantDetails = (variantId: string) => {
    return selectedProducts
      ?.map((i) => i.variants)
      ?.flat(1)
      ?.find((i) => i.id === variantId);
  };

  const handleGetCustomersList = async (query: string) => {
    const res = await getCustomers(query, 0, 4);
    if (isActionError(res)) {
      return [];
    }
    return res.data;
  };

  const handleGetProductList = async (query: string) => {
    const res = await getProductWithVariants(query, 0, 4);
    if (isActionError(res)) {
      return [];
    }
    return res.data;
  };

  const handleAppendItem = () => {
    items.append(getSaleItemDefault());
  };

  const handleRemoveItem = (index: number) => () => {
    deleteProducts(index);
    items.remove(index);
  };

  const totalDiscountedPriceFromIndividual = form
    .watch("saleItems")
    ?.reduce((total, item) => {
      return total + Number(item.discountedPrice);
    }, 0);

  const totalBodyRates = form.watch("saleItems")?.reduce((total, item) => {
    return total + Number(item.price) * Number(item.quantity);
  }, 0);

  const totalMsp = form.watch("saleItems")?.reduce((total, saleItem) => {
    return (
      total +
      Number(variantDetails(saleItem.variantId)?.msp) *
        Number(saleItem.quantity)
    );
  }, 0);

  const totalCostPrice = form.watch("saleItems")?.reduce((total, item) => {
    return (
      total +
      Number(variantDetails(item.variantId)?.costPrice) * Number(item.quantity)
    );
  }, 0);

  useEffect(() => {
    // set total price
    form.setValue("totalPrice", totalBodyRates?.toString());
  }, [totalBodyRates]);

  useEffect(() => {
    form.setValue(
      "totalDiscountedPrice",
      (totalDiscountedPriceFromIndividual || "").toString(),
    );
  }, [totalDiscountedPriceFromIndividual]);

  useEffect(() => {
    items.fields.length === 0 && handleAppendItem();
  }, [items.fields]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <SearchCombo
                getListItems={handleGetCustomersList}
                list={customers || []}
                onListChange={(e) => setCustomers(e)}
              >
                <SearchComboTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="w-full flex justify-between"
                      ref={field.ref}
                    >
                      {customerDetails?.name || "Select Customer"}
                      <ChevronDown size={16} />
                    </Button>
                  </FormControl>
                </SearchComboTrigger>
                <SearchComboContent>
                  <SearchComboInput placeholder="Search..." />
                  <SearchComboEmpty>
                    {(state) =>
                      state.loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : state.query ? (
                        <Link href={"/customers/add"}>
                          <Button>Add Customer</Button>
                        </Link>
                      ) : (
                        <p className="text-muted-foreground">
                          No customers found
                        </p>
                      )
                    }
                  </SearchComboEmpty>
                  <SearchComboList>
                    {(state) =>
                      (state.list as TDBCustomer[])?.map((customer) => (
                        <PopoverClose
                          key={customer.id}
                          className="block w-full"
                          asChild
                        >
                          <SearchComboListItem
                            onClick={() => {
                              form.setValue(
                                "customerId",
                                customer.id.toString(),
                              );
                            }}
                          >
                            <SearchComboListItemTitle>
                              {customer.name}
                            </SearchComboListItemTitle>
                            <SearchComboListItemDescription>
                              {customer.phone}
                            </SearchComboListItemDescription>
                          </SearchComboListItem>
                        </PopoverClose>
                      ))
                    }
                  </SearchComboList>
                </SearchComboContent>
              </SearchCombo>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-8">
          {items.fields.map((item, index) => (
            <React.Fragment key={item.id.toString()}>
              {index !== 0 && <Separator className="bg-muted-foreground/70" />}
              <section key={item.id} className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`saleItems.${index}`}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="flex justify-between items-center">
                        <FormLabel>Item {index + 1}</FormLabel>
                        <Button
                          type="button"
                          variant={"destructive"}
                          className="px-1 h-6"
                          onClick={handleRemoveItem(index)}
                        >
                          <Trash2 size={10} className="scale-90" />
                        </Button>
                      </div>
                      <FormControl>
                        <SearchCombo
                          getListItems={handleGetProductList}
                          list={products?.[index] || []}
                          onListChange={(e) => {
                            updateProducts(index, e);
                          }}
                        >
                          <SearchComboTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full flex justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {productDetails(field.value.productId)?.title ||
                                  "Select Product"}
                              </div>
                              <ChevronDown size={16} />
                            </Button>
                          </SearchComboTrigger>
                          <SearchComboContent>
                            <SearchComboInput placeholder="Search..." />
                            <SearchComboEmpty>
                              {(state) =>
                                state.loading ? (
                                  <Loader2 className="animate-spin h-4 w-4" />
                                ) : state.query ? (
                                  <Link href={"/products/add"}>
                                    <Button>Add Product</Button>
                                  </Link>
                                ) : (
                                  <p className="text-muted-foreground">
                                    No products found
                                  </p>
                                )
                              }
                            </SearchComboEmpty>
                            <SearchComboList>
                              {(state) =>
                                (
                                  state.list as TDBProductWithVariantsForSale[]
                                )?.map((product, idx) => (
                                  <SearchComboListItem
                                    key={idx}
                                    onClick={() => {
                                      form.setValue(`saleItems.${index}`, {
                                        ...form.getValues(`saleItems.${index}`),
                                        productId: product.id.toString(),
                                        variantId: "",
                                      });
                                      updateSelectedProduct(index, product);
                                      state.reset();
                                    }}
                                    className="flex flex-row justify-start items-center gap-3"
                                  >
                                    <AdvancedImage
                                      imageId={product.image ?? ""}
                                      alt="product-image"
                                      height={50}
                                      width={50}
                                      className="rounded-md shrink-0 h-12 w-12 object-cover"
                                    />
                                    <div className="self-stretch spce-y-1">
                                      <SearchComboListItemTitle>
                                        {product?.title}
                                      </SearchComboListItemTitle>
                                    </div>
                                  </SearchComboListItem>
                                ))
                              }
                            </SearchComboList>
                          </SearchComboContent>
                        </SearchCombo>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`saleItems.${index}.variantId`}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "col-span-2 hidden",
                        form.watch(`saleItems.${index}.productId`) && "block",
                      )}
                    >
                      <Select
                        value={field.value}
                        onValueChange={(e) => {
                          field.onChange(e);

                          form.setValue(`saleItems.${index}`, {
                            ...form.getValues(`saleItems.${index}`),
                            price: variantDetails(e)?.price?.toString() ?? "",
                            costPrice:
                              variantDetails(e)?.costPrice?.toString() ?? "",
                          });

                          form.setValue(
                            `saleItems.${index}.discountedPrice`,
                            Number(
                              Number(variantDetails(e)?.price) *
                                Number(
                                  form.getValues(`saleItems.${index}.quantity`),
                                ),
                            ).toString(),
                          );
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {productDetails(
                              form.watch(`saleItems.${index}.productId`),
                            )?.variants?.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id}>
                                <p className="flex justify-start items-center">
                                  {variant.feet ? (
                                    <span>
                                      {variant.feet}
                                      <span className="ml-0.5">ft&nbsp;</span>
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                  {variant.inch ? (
                                    <span>
                                      {variant.inch}
                                      <span className="ml-0.5">in</span>
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                  <Dot /> ₹{" "}
                                  <span className="font-medium">
                                    {formatNumber(variant.price)}
                                  </span>
                                  <Dot /> ₹{" "}
                                  <span className="font-medium">
                                    {formatNumber(Number(variant.msp))}
                                  </span>
                                  <Dot /> ₹{" "}
                                  <span className="font-medium">
                                    {formatNumber(variant.costPrice)}
                                  </span>
                                  <Dot />
                                  <span className="text-muted-foreground">
                                    {variant.quantity} left
                                  </span>
                                </p>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`saleItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "hidden",
                        form.watch(`saleItems.${index}.variantId`) && "block",
                      )}
                    >
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue(
                              `saleItems.${index}.discountedPrice`,
                              (
                                Number(e.target.value) *
                                Number(
                                  variantDetails(
                                    form.getValues(
                                      `saleItems.${index}.variantId`,
                                    ),
                                  )?.price,
                                )
                              ).toString(),
                            );
                          }}
                          type="number"
                          placeholder="Quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`saleItems.${index}`}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "hidden",
                        form.watch(`saleItems.${index}.variantId`) && "block",
                      )}
                    >
                      <FormControl>
                        <Input
                          value={
                            "₹" +
                            formatNumber(
                              Number(
                                form.watch(`saleItems.${index}.quantity`),
                              ) * Number(field.value.price),
                            ) +
                            " — " +
                            "₹" +
                            formatNumber(
                              Number(
                                form.watch(`saleItems.${index}.quantity`),
                              ) *
                                Number(
                                  variantDetails(field.value.variantId)?.msp,
                                ),
                            ) +
                            " — " +
                            "₹" +
                            formatNumber(
                              Number(
                                form.watch(`saleItems.${index}.quantity`),
                              ) *
                                Number(
                                  variantDetails(field.value.variantId)
                                    ?.costPrice,
                                ),
                            )
                          }
                          readOnly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`saleItems.${index}.discountedPrice`}
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "hidden col-span-2",
                        form.watch(`saleItems.${index}.variantId`) && "block",
                      )}
                    >
                      <FormLabel>Discounted Price </FormLabel>
                      <FormControl>
                        <InputWithPrefixNode
                          PrefixNode={IndianRupee}
                          type="number"
                          placeholder="Discounted Price"
                          className={field.value?.toString()}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            className="px-3"
            variant={"secondary"}
            onClick={handleAppendItem}
          >
            Add Item
          </Button>
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Total Price"
                    value={
                      "₹" +
                      formatNumber(Number(totalBodyRates)) +
                      " — " +
                      "₹" +
                      formatNumber(Number(totalMsp)) +
                      " — " +
                      "₹" +
                      formatNumber(Number(totalCostPrice))
                    }
                    readOnly
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalDiscountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Discounted Price</FormLabel>
                <FormControl>
                  <InputWithPrefixNode
                    PrefixNode={IndianRupee}
                    type="number"
                    placeholder={"Total Discounted Price"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-full">
          {form.formState.isSubmitting && (
            <Loader2 className="animate-spin h-4 w-4" />
          )}
          <span>Create</span>
        </Button>
      </form>
    </Form>
  );
}
