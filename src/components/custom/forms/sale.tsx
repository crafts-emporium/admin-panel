"use client";

import { getCustomers } from "@/actions/customer";
import { getVariantsWithproductInfo } from "@/actions/products";
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
import { TSale } from "@/schema/sale";
import { TDBVariantWithProduct } from "@/types/product";
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
import { useEffect } from "react";
import InputWithPrefixNode from "@/components/ui/input-with-prefixnode";

export default function SaleForm({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<TSale>>;
  onSubmit: (e: TSale) => void;
}) {
  const { customers, variants, setCustomers, updateVariants, deleteVariants } =
    useSaleFormMetadata();
  const items = useFieldArray({
    control: form.control,
    name: "saleItems",
  });
  const customerDetails = customers?.find(
    (item) => item.id.toString() === form.watch("customerId"),
  );
  const productDetails = (index: number) => (id: string) =>
    variants?.[index]?.find((item) => item.id.toString() === id);

  const handleGetCustomersList = async (query: string) => {
    const res = await getCustomers(query, 0, 4);
    if (isActionError(res)) {
      return [];
    }
    return res.data;
  };

  const handleGetProductList = async (query: string) => {
    const res = await getVariantsWithproductInfo(query, 0, 4);
    if (isActionError(res)) {
      return [];
    }
    return res.data;
  };

  const handleAppendItem = () => {
    items.append({
      variantId: "",
      price: "",
      quantity: "",
    });
  };

  const handleRemoveItem = (index: number) => () => {
    deleteVariants(index);
    items.remove(index);
  };

  useEffect(() => {
    items.fields.length === 0 && handleAppendItem();
  }, [items.fields]);

  const totalPrice =
    form.watch("saleItems")?.reduce((total, item) => {
      return total + Number(item.price) * Number(item.quantity);
    }, 0) || "";

  useEffect(() => {
    // set total price
    form.setValue("totalPrice", totalPrice?.toString());

    // set discounted price if it doesn't exists or is greater than total price
    form.getValues("totalDiscountedPrice")
      ? Number(form.getValues("totalDiscountedPrice")) > Number(totalPrice)
        ? form.setValue("totalDiscountedPrice", totalPrice?.toString())
        : null
      : form.setValue("totalDiscountedPrice", totalPrice?.toString());
  }, [totalPrice]);

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
        <div className="space-y-3">
          {items.fields.map((item, index) => (
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
                        list={variants?.[index] || []}
                        onListChange={(e) => {
                          updateVariants(e, index);
                        }}
                      >
                        <SearchComboTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full flex justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {productDetails(index)(field.value.variantId)
                                ?.title || "Select Product"}
                              <p className="text-xs text-muted-foreground">
                                {form.watch(`saleItems.${index}.variantId`) &&
                                  `${
                                    productDetails(index)(field.value.variantId)
                                      ?.size
                                  } inches  ₹${
                                    productDetails(index)(field.value.variantId)
                                      ?.price
                                  }`}
                              </p>
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
                              (state.list as TDBVariantWithProduct[])?.map(
                                (product) => (
                                  <SearchComboListItem
                                    key={product.id}
                                    onClick={() =>
                                      form.setValue(`saleItems.${index}`, {
                                        ...form.getValues(`saleItems.${index}`),
                                        variantId: product.id,
                                        price: product.price?.toString(),
                                      })
                                    }
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
                                        {product.title}
                                      </SearchComboListItemTitle>
                                      <div className="flex justify-start items-center gap-2 [&>*]:whitespace-nowrap">
                                        <SearchComboListItemDescription>
                                          {product.size} <span>inches</span>
                                        </SearchComboListItemDescription>
                                        <Dot
                                          size={10}
                                          className="scale-[2] shrink-0"
                                        />
                                        <SearchComboListItemDescription>
                                          {product.quantity} <span>pcs</span>
                                        </SearchComboListItemDescription>
                                        <Dot
                                          size={10}
                                          className="scale-[2] shrink-0"
                                        />
                                        <SearchComboListItemDescription>
                                          ₹{product.price}
                                        </SearchComboListItemDescription>
                                      </div>
                                    </div>
                                  </SearchComboListItem>
                                ),
                              )
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
                name={`saleItems.${index}.quantity`}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "hidden",
                      form.watch(`saleItems.${index}.variantId`) && "block",
                    )}
                  >
                    <FormControl>
                      <Input {...field} type="number" placeholder="Quantity" />
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
                      <InputWithPrefixNode
                        PrefixNode={IndianRupee}
                        value={
                          Number(form.watch(`saleItems.${index}.quantity`)) *
                          Number(field.value.price)
                        }
                        readOnly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
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
                  <InputWithPrefixNode
                    PrefixNode={IndianRupee}
                    placeholder="Total Price"
                    value={field.value}
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
                <FormControl>
                  <InputWithPrefixNode
                    PrefixNode={IndianRupee}
                    type="number"
                    placeholder={`Total Discounted Price : ${totalPrice}`}
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
