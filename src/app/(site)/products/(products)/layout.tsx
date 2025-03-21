export default function Layout({
  children,
  records,
  search,
}: {
  children: React.ReactNode;
  records: React.ReactNode;
  search: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}
      {search}
      {records}
    </div>
  );
}
