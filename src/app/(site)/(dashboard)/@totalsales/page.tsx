import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default async function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Sales</CardTitle>
        <TrendingUp />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">34</h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">+10</span> from yesterday
        </p>
      </CardContent>
    </Card>
  );
}
