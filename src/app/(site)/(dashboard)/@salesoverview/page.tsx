import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { RevenueChart } from "./_components/bar-chart";

export default function Page() {
  return (
    <Card>
      <CardHeader className="flex-row space-y-0 justify-between items-center">
        <CardTitle>Sales Overview</CardTitle>
        <TrendingUp />
      </CardHeader>
      <CardContent>
        <RevenueChart />
      </CardContent>
    </Card>
  );
}
