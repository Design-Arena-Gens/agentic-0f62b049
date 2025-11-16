import Link from 'next/link';
import { cookies } from 'next/headers';
import AdminPanel from '@/components/AdminPanel';
import ReaderGate from '@/components/ReaderGate';
import { getBooks, getSiteSettings } from '@/lib/data';

export default async function Home() {
  const cookieStore = await cookies();
  const readerName = cookieStore.get('readerName')?.value ?? null;
  const readerId = cookieStore.get('readerId')?.value ?? null;
  const [settings, books] = await Promise.all([getSiteSettings(), getBooks()]);

  return (
    <main className="relative min-h-screen bg-slate-950 text-white">
      <ReaderGate initialName={readerName} initialId={readerId} />
      <AdminPanel />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow to-opacity-70 absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.4),transparent_60%)] blur-2xl" />
        <div className="animate-pulse-slower absolute -right-32 bottom-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.45),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="w-full border-b border-white/10 bg-black/90 py-3 text-center text-sm font-medium uppercase tracking-[0.5em] text-white shadow-[0_8px_40px_rgba(15,23,42,0.45)]">
          {settings.siteTitle}
        </div>
        <header className="relative px-6 pb-12 pt-16 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">
                Curated Reading Universe
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Ignite your mind with{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-400 bg-clip-text text-transparent">
                  precision-crafted knowledge
                </span>
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Dive into books engineered for thinkers. Each title unfolds into
                chapters and topic-level insights designed for frictionless mobile reading.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 uppercase tracking-[0.3em] text-cyan-100">
                  {books.length} Books
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 uppercase tracking-[0.3em] text-indigo-100">
                  Live Chapters &amp; Topics
                </span>
              </div>
              {readerName ? (
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Welcome back, {readerName}
                </p>
              ) : (
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                  You&apos;ll be prompted for your name on first visit
                </p>
              )}
            </div>
            <div className="relative flex w-full max-w-sm flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur-xl md:w-80">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-cyan-400/15 via-transparent to-indigo-500/10" />
              <h2 className="text-lg font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Structure Snapshot
              </h2>
              <ul className="w-full space-y-3 text-sm">
                {books.slice(0, 4).map((book) => (
                  <li
                    key={book._id}
                    className="rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3"
                  >
                    <p className="font-semibold text-white">{book.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
                      {book.chapters.length} Chapters
                    </p>
                  </li>
                ))}
                {!books.length ? (
                  <li className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                    Books curated by admin appear here.
                  </li>
                ) : null}
              </ul>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Tailored for on-the-go knowledge sessions
              </span>
            </div>
          </div>
        </header>

        <section className="relative z-10 flex-1 bg-slate-950/90 px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  Bookshelf
                </h2>
                <p className="text-sm text-slate-300">
                  Tap any title to unfold its chapters and topics.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
                Two books per row layout
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 max-[520px]:grid-cols-1">
              {books.map((book) => (
                <article
                  key={book._id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-[1px] transition-transform duration-500 hover:-translate-y-1"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-40 blur-3xl transition duration-700 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at top, ${book.accentColor ?? '#38bdf8'}40, transparent 70%)`,
                      opacity: 0.6,
                    }}
                  />
                  <div className="relative flex flex-1 flex-col rounded-[26px] bg-slate-950/90 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-inner">
                        {book.title.slice(0, 2).toUpperCase()}
                      </span>
                      <span
                        className="h-2 w-20 rounded-full"
                        style={{
                          background: book.accentColor ?? '#38bdf8',
                        }}
                      />
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {book.title}
                    </h3>
                    {book.subtitle ? (
                      <p className="mt-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
                        {book.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-4 max-h-24 overflow-hidden text-ellipsis text-sm leading-relaxed text-slate-300">
                      {book.description || 'Awaiting a captivating synopsis.'}
                    </p>
                    <div className="mt-auto pt-6">
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                        <span>{book.chapters.length} Chapters</span>
                        <span className="h-1 w-1 rounded-full bg-slate-500" />
                        <span>
                          {book.chapters.reduce(
                            (total, chapter) => total + chapter.topics.length,
                            0,
                          )}{' '}
                          Topics
                        </span>
                      </div>
                      <Link
                        href={`/books/${book._id}`}
                        className="mt-4 inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/70 hover:bg-cyan-400/10"
                      >
                        Enter Book
                        <span className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 align-middle text-xs">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
              {books.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-300">
                  No books published yet. The administrator can craft them via
                  the command panel.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
