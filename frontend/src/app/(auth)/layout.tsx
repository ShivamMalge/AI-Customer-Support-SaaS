export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
      <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
}
