import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Amphora } from "lucide-react";

export default async function Page() {
  return (
    <Card>
      <CardHeader className="font-semibold flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Products</CardTitle>
        <Amphora />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">239</h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">+10</span> new products
        </p>
      </CardContent>
    </Card>
  );
}
