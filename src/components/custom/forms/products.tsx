"use client";

import { useLayoutEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CheckCircle2,
  CircleX,
  Hash,
  IndianRupee,
  Loader2,
  Paperclip,
  PencilRuler,
  Trash2,
} from "lucide-react";
import { TProduct, getVariantsDefault } from "@/schema/products";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nanoid } from "nanoid";
import { UploadStatus } from "@/types/upload-status";
import useUploadImage from "@/hooks/use-upload-image";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProductForm({
  form,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<TProduct>>;
  onSubmit: (e: TProduct) => void;
}) {
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  const { upload, compressImage } = useUploadImage();

  const handleRemoveVariant = (index: number) => {
    remove(index);
  };
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

  const dropzone = useDropzone({
    accept: {
      "image/*": [],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      setUploadStatus("loading");
      const file = acceptedFiles[0];

      const fileExt = file.name.split(".").pop();
      const key = `${nanoid()}.${fileExt}`;
      form.setValue("imageId", key);

      const compressedImage = await compressImage(file);

      //@ts-ignore
      const status = await upload(key, file.type, compressedImage);

      setUploadStatus(status);
    },
  });

  const isImageUploadable = !Boolean(form.watch("imageId"));

  const handleDeleteImage = () => {
    form.setValue("imageId", "");
  };

  useLayoutEffect(() => {
    if (fields.length === 0) {
      append(getVariantsDefault());
    }
  }, [fields]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="file" hidden {...dropzone.getInputProps()} />
        <Button
          variant={"outline"}
          type="button"
          className={cn(
            "w-full py-10",
            !isImageUploadable && "cursor-not-allowed",
          )}
          {...dropzone.getRootProps()}
          disabled={!isImageUploadable}
        >
          Upload
        </Button>
        {form.watch("imageId") && (
          <div
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full flex justify-between pr-1 border-dashed",
            )}
          >
            <Paperclip size={14} />
            <p className="w-full flex justify-start items-center gap-2">
              {form.watch("imageId")}
              {uploadStatus === "success" && (
                <CheckCircle2 size={10} className="text-green-500" />
              )}
              {uploadStatus === "loading" && (
                <Loader2 size={10} className="animate-spin" />
              )}
              {uploadStatus === "error" && (
                <CircleX size={10} className="text-red-500" />
              )}
            </p>
            <Button
              variant={"destructive"}
              className="p-1 h-7"
              type="button"
              onClick={handleDeleteImage}
            >
              <Trash2 size={10} />
            </Button>
          </div>
        )}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 @container">
          {fields?.map((field, index) => (
            <section key={field.id} className="">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm">Variant {index + 1}</h3>
                <Button
                  className="px-2 h-7"
                  variant={"destructive"}
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid @lg:grid-cols-2 grid-cols-1 gap-2">
                <Label className="@lg:col-span-2">Size</Label>
                <FormField
                  control={form.control}
                  name={`variants.${index}.feet`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Feet"
                            type="number"
                            className="pl-7"
                          />
                          <PencilRuler
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                          <div
                            className={cn(
                              "absolute top-0 right-0 h-full w-auto px-2",
                              "grid place-content-center",
                            )}
                          >
                            <span className="text-muted-foreground text-sm">
                              feet
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.inch`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Inch"
                            type="number"
                            className="pl-7"
                          />
                          <PencilRuler
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                          <div
                            className={cn(
                              "absolute top-0 right-0 h-full w-auto px-2",
                              "grid place-content-center",
                            )}
                          >
                            <span className="text-muted-foreground text-sm">
                              inch
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Quantity"
                            type="number"
                            className="pl-7"
                          />
                          <Hash
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.costPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Cost Price"
                            type="number"
                            className="pl-7"
                          />
                          <IndianRupee
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.msp`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MSP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="MSP"
                            type="number"
                            className="pl-7"
                          />
                          <IndianRupee
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Price"
                            type="number"
                            className="pl-7"
                          />
                          <IndianRupee
                            className="absolute top-1/2 left-2 -translate-y-1/2"
                            size={14}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variants.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="@lg:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea {...field} placeholder="Description" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {index < fields.length - 1 && (
                <Separator className="my-10 bg-muted-foreground/70" />
              )}
            </section>
          ))}
        </div>
        <Button
          className="w-full"
          variant={"secondary"}
          type="button"
          onClick={() => append(getVariantsDefault())}
        >
          Add Variant
        </Button>
        <Button type="submit" className="w-full">
          <Loader2
            className={cn(
              "h-4 w-4 animate-spin hidden",
              form.formState.isSubmitting && "block",
            )}
          />
          Submit
        </Button>
      </form>
    </Form>
  );
}
