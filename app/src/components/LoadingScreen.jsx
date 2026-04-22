export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-surface px-6 text-center">
      <img
        src="/loading.png"
        alt="Loading"
        className="w-[min(70vw,380px)] h-auto object-contain mb-8 animate-float"
      />
      <span className="font-headline text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold text-primary tracking-tight animate-pulse-text">
        {message}
      </span>
    </div>
  );
}
