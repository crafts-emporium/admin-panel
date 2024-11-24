export default function Layout({
  children,
  totalsale,
  totalrevenue,
  customers,
  inventorycount,
  inventoryworth,
}: {
  children: React.ReactNode;
  totalsale: React.ReactNode;
  totalrevenue: React.ReactNode;
  customers: React.ReactNode;
  inventorycount: React.ReactNode;
  inventoryworth: React.ReactNode;
}) {
  return (
    <div className="@container space-y-6">
      {children}
      <div className="grid gap-4 @6xl:grid-cols-4 @4xl:grid-cols-3 @xl:grid-cols-2 grid-cols-1">
        {totalsale}
        {totalrevenue}
        {inventorycount}
        {inventoryworth}
        {customers}
      </div>
    </div>
  );
}
