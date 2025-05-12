export default function Layout({
  children,
  totalproducts,
  totalrevenue,
  totalsales,
  totalcustomers,
  revenueoverview,
  salesoverview,
  topcustomers,
  topproducts,
  inventoryworth,
}: {
  children: React.ReactNode;
  totalproducts: React.ReactNode;
  totalrevenue: React.ReactNode;
  totalsales: React.ReactNode;
  totalcustomers: React.ReactNode;
  revenueoverview: React.ReactNode;
  salesoverview: React.ReactNode;
  topproducts: React.ReactNode;
  topcustomers: React.ReactNode;
  inventoryworth: React.ReactNode;
}) {
  return (
    <div className="@container space-y-4">
      {children}
      <section className="grid gap-4 @6xl:grid-cols-4 @4xl:grid-cols-3 @xl:grid-cols-2 grid-cols-1">
        {totalproducts}
        {totalrevenue}
        {totalsales}
        {/* {totalcustomers} */}
        {inventoryworth}
      </section>
      {/* <section className="grid @3xl:grid-cols-2 gap-4">
        {revenueoverview}
        {salesoverview}
      </section> */}
      {/* <section className="grid @3xl:grid-cols-2 gap-4">
        {topproducts}
        {topcustomers}
      </section> */}
    </div>
  );
}
