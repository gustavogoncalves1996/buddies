function Pulse({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-container-high ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] bg-surface overflow-hidden">
      <Pulse className="absolute inset-0 rounded-none opacity-70" />
      <div className="absolute top-5 left-5 right-5 md:right-auto flex gap-2">
        <Pulse className="h-10 w-28 rounded-full" />
        <Pulse className="h-10 w-20 rounded-full" />
        <Pulse className="h-10 w-24 rounded-full" />
      </div>
      <div className="absolute bottom-20 md:bottom-12 left-4 right-4 md:left-12 md:right-12 flex gap-4 overflow-hidden">
        {[0, 1, 2].map((item) => (
          <Pulse key={item} className="h-36 md:h-52 w-80 md:w-110 shrink-0" />
        ))}
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-surface px-6 lg:px-12 py-8 space-y-8">
      <Pulse className="h-64 md:h-125 max-w-350 mx-auto" />
      <div className="max-w-350 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <Pulse className="h-16 rounded-full" />
          <Pulse className="h-24" />
          <div className="grid grid-cols-2 gap-4">
            <Pulse className="h-40" />
            <Pulse className="h-40" />
          </div>
        </div>
        <Pulse className="hidden lg:block lg:col-span-4 h-80" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      <Pulse className="hidden md:block h-170 rounded-none" />
      <div className="md:hidden bg-surface-container-high py-10 px-6 flex flex-col items-center gap-4">
        <Pulse className="h-24 w-24 rounded-full" />
        <Pulse className="h-8 w-48" />
        <Pulse className="h-4 w-64" />
      </div>
      <div className="max-w-350 mx-auto px-5 md:px-12 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <Pulse key={item} className="h-56" />
        ))}
      </div>
    </div>
  );
}

export function ManageSkeleton() {
  return (
    <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-73px)] bg-surface overflow-hidden">
      <Pulse className="absolute inset-0 rounded-none opacity-70" />
      <div className="absolute top-6 left-6 right-6 md:left-12 md:right-12 space-y-5">
        <Pulse className="h-12 w-72" />
        <Pulse className="h-12 w-64 rounded-full" />
      </div>
      <div className="absolute bottom-5 left-4 right-4 md:left-12 md:right-12 flex gap-4 overflow-hidden">
        {[0, 1, 2].map((item) => (
          <Pulse key={item} className="h-40 w-96 shrink-0" />
        ))}
      </div>
    </div>
  );
}