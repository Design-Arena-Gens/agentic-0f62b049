import Link from 'next/link';

export default function BookNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
          Book missing
        </p>
        <h1 className="text-4xl font-semibold text-white">
          This manuscript has not been published yet.
        </h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-slate-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
        >
          ← Return to library
        </Link>
      </div>
    </main>
  );
}
