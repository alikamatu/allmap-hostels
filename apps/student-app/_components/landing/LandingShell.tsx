export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans text-black antialiased selection:bg-orange-600 selection:text-white">
      {children}
    </div>
  );
}
