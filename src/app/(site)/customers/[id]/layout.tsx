export default function Layout({
  children,
  saledetails,
}: {
  children: React.ReactNode;
  saledetails: React.ReactNode;
}) {
  return (
    <div className="@container space-y-10">
      {children}
      <main>{saledetails}</main>
    </div>
  );
}
