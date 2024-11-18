import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Revenue</CardTitle>
        <BadgeDollarSign />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">₹1,200</h1>
        <p className="text-muted-foreground">
          <span className="text-green-500">+230</span> from yesterday
        </p>
      </CardContent>
    </Card>
  );
}
