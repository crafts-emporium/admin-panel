export default function Layout({
  children,
  search,
  records,
}: {
  children: React.ReactNode;
  search: React.ReactNode;
  records: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
      {search}
      {records}
    </div>
  );
}
