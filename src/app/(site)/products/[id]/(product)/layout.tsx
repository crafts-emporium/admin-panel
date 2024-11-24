export default function Layout({
  children,
  totalrevenue,
  totalsale,
  inventorycount,
  inventoryworth,
  customers,
  productdetails,
}: {
  children: React.ReactNode;
  totalrevenue: React.ReactNode;
  totalsale: React.ReactNode;
  inventorycount: React.ReactNode;
  inventoryworth: React.ReactNode;
  customers: React.ReactNode;
  productdetails: React.ReactNode;
}) {
  return (
    <div className="space-y-6 @container">
      {productdetails}

      <div className="grid gap-4 @6xl:grid-cols-4 @4xl:grid-cols-3 @xl:grid-cols-2 grid-cols-1">
        {totalsale}
        {totalrevenue}
        {inventorycount}
        {inventoryworth}
        {customers}
      </div>
      {children}
    </div>
  );
}
