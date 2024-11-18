import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound } from "lucide-react";

export default function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Total Customers</CardTitle>
        <UsersRound />
      </CardHeader>
      <CardContent className="space-y-1">
        <h1 className="sm:text-4xl text-3xl font-semibold">101</h1>
        <p>
          <span className="text-green-500">+10</span> new customers
        </p>
      </CardContent>
    </Card>
  );
}
