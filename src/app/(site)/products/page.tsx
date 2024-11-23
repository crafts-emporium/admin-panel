import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/custom/page-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Suspense } from "react";
import SearchInput from "./_components/search-input";
import { isActionError } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/actions/products";
import AdvancedImage from "@/components/custom/advanced-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductDropdownMenu from "./_components/dropdown-menu";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const query = (params.query || "") as string;

  const res = await getProducts(query, page - 1);
  if (isActionError(res)) {
    return <p>{res.error}</p>;
  }

  const { data: products, total: total_records } = res;

  const prev_page = page > 1 ? page - 1 : 1;
  const next_page =
    page < Math.ceil(total_records / 10)
      ? page + 1
      : Math.ceil(total_records / 10);

  const record_count_start = (page - 1) * 10 + (products.length ? 1 : 0);
  const record_count_end = Math.min(page * 10, total_records);

  const next_page_url = `/products?${new URLSearchParams({
    ...(params || {}),
    page: next_page.toString(),
  }).toString()}`;

  const prev_page_url = `/products?${new URLSearchParams({
    ...(params || {}),
    page: prev_page.toString(),
  }).toString()}`;

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <PageHeader>
          <PageTitle>Products</PageTitle>
          <PageDescription>View and manage your products</PageDescription>
        </PageHeader>
        <Link href={"/products/add"}>
          <Button className="px-3">
            <Plus />
            <span className="sm:inline hidden">Add Product</span>
          </Button>
        </Link>
      </header>
      <div>
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>
      <Card className="overflow-hidden @container">
        <CardContent className="px-0">
          <Table className="border-b">
            <TableHeader>
              <TableRow className="border-none hover:bg-background">
                <TableHead
                  className="p-4 border-r hover:bg-accent"
                  rowSpan={2}
                  colSpan={1}
                >
                  Product
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="border-b p-4 hover:bg-accent text-center"
                >
                  Variants
                </TableHead>
                <TableHead
                  rowSpan={2}
                  colSpan={1}
                  className="border-l text-center hover:bg-accent"
                >
                  Actions
                </TableHead>
              </TableRow>
              <TableRow className="border-t-0">
                <TableHead className="p-4">Size</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) =>
                product.variants.map((variant, j) => (
                  <TableRow
                    key={`${product.id}-${j}`}
                    className="hover:bg-background"
                  >
                    {j === 0 && (
                      <TableCell
                        rowSpan={product.variants.length}
                        colSpan={1}
                        className="border-r w-fit py-4"
                      >
                        <div className="flex @3xl:flex-row @3xl:text-left text-center flex-col justify-start items-center gap-6">
                          <div className="w-[100px] shrink-0">
                            <AdvancedImage
                              imageId={product.image || ""}
                              width={80}
                              height={80}
                              className="aspect-square rounded-md object-cover h-24 w-24"
                              alt="Product Image"
                            />
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-lg font-medium">
                              {product.title}
                            </h2>
                            <p className="@2xl:line-clamp-5 line-clamp-3 text-sm font-normal text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="p-4">{variant.size}</TableCell>
                    <TableCell>{variant.quantity}</TableCell>
                    <TableCell>₹{variant.price}</TableCell>
                    {j == 0 && (
                      <TableCell
                        className="border-l text-center "
                        rowSpan={product.variants.length}
                      >
                        <ProductDropdownMenu product={product}>
                          <Button variant={"outline"} className="px-3">
                            <MoreHorizontal />
                          </Button>
                        </ProductDropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <p className="w-full">
            {record_count_start} to {record_count_end} of&nbsp;
            <span className="font-semibold">{total_records}</span> entries
          </p>
          <Link href={prev_page_url}>
            <Button variant={"secondary"} className="h-8 px-3">
              Prev
            </Button>
          </Link>
          <Link href={next_page_url}>
            <Button className="h-8 px-3">Next</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
