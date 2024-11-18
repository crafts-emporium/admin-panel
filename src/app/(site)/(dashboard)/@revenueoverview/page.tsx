import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeDollarSign } from "lucide-react";
import { RevenueChart } from "./_components/bar-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Revenue Overview</CardTitle>
        <BadgeDollarSign />
      </CardHeader>
      <CardContent>
        <RevenueChart />
      </CardContent>
    </Card>
  );
}
