import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Amphora } from "lucide-react";
import Image from "next/image";
import handcraft from "@/../public/istockphoto.jpg";

export default function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Top Products</CardTitle>
        <Amphora />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="flex items-center gap-2">
                  <Image
                    alt="product-image"
                    src={handcraft}
                    width={50}
                    height={50}
                    className="rounded-md sm:inline-block hidden"
                  />
                  <p>Vas</p>
                </TableCell>
                <TableCell>45 inch</TableCell>
                <TableCell>10</TableCell>
                <TableCell>₹1,200</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell className="text-base">50</TableCell>
              <TableCell className="font-semibold text-base">₹4,800</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
