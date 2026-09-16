export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#ccfbf1_0,_#f8fafc_45%)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-muted bg-surface p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
