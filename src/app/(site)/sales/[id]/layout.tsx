export default function Layout({
  children,
  customer,
}: {
  children: React.ReactNode;
  customer: React.ReactNode;
}) {
  return (
    <div className="space-y-6 @container">
      {customer}
      {children}
    </div>
  );
}
