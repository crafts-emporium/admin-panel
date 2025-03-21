export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[100dvh] flex justify-center items-center">
      {children}
    </div>
  );
}
