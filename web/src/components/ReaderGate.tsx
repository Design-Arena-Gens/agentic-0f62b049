'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReaderGateProps {
  initialName?: string | null;
  initialId?: string | null;
}

export default function ReaderGate({
  initialName,
  initialId,
}: ReaderGateProps) {
  const [name, setName] = useState(initialName ?? '');
  const [readerId, setReaderId] = useState(initialId ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const alreadyRegistered = Boolean(name && readerId);

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please introduce yourself before entering.');
      return;
    }

    try {
      setPending(true);
      setError(null);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const payload = await response.json();
      const newId = payload.readerId as string;
      setReaderId(newId);

      const tenYears = 60 * 60 * 24 * 365 * 10;
      document.cookie = `readerName=${encodeURIComponent(trimmed)}; path=/; max-age=${tenYears}; sameSite=Lax`;
      document.cookie = `readerId=${encodeURIComponent(newId)}; path=/; max-age=${tenYears}; sameSite=Lax`;

      router.refresh();
    } catch (err) {
      console.error(err);
      setError('We could not save your name. Please try again.');
    } finally {
      setPending(false);
    }
  };

  if (!isMounted || alreadyRegistered) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg">
      <form
        onSubmit={register}
        className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-[1px]">
          <div className="flex h-full w-full items-center justify-center rounded-[23px] bg-slate-950">
            <span className="text-2xl font-semibold text-cyan-200">Hi</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Who&apos;s Reading?
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Share your name to tailor your journey. It also keeps the curator in
          sync.
        </p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-xl shadow-emerald-500/30 transition hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Saving...' : 'Enter Library'}
        </button>
        {error ? (
          <p className="mt-3 text-sm text-rose-300">{error}</p>
        ) : null}
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          We remember you for future visits
        </p>
      </form>
    </div>
  );
}
