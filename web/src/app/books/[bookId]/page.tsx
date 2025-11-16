import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookById, getSiteSettings } from '@/lib/data';

interface PageProps {
  params: {
    bookId: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const book = await getBookById(params.bookId);
  if (!book) {
    return {
      title: 'Book not found',
    };
  }

  return {
    title: `${book.title} | ${book.subtitle ?? 'Knowledge Suite'}`,
    description: book.description,
  };
}

export default async function BookPage({ params }: PageProps) {
  const book = await getBookById(params.bookId);

  if (!book) {
    notFound();
  }

  const siteSettings = await getSiteSettings();

  return (
    <main className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.4),transparent_60%)] blur-2xl" />
        <div className="animate-pulse-slower absolute -right-32 bottom-10 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.45),transparent_60%)] blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="w-full border-b border-white/10 bg-black/90 py-3 text-center text-sm font-medium uppercase tracking-[0.5em] text-white shadow-[0_8px_40px_rgba(15,23,42,0.45)]">
          {siteSettings.siteTitle}
        </div>
        <header className="px-6 pb-12 pt-16 md:px-10 lg:px-16">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
            >
              ← Back to library
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-100">
              Book Overview
            </span>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="text-lg uppercase tracking-[0.3em] text-cyan-200">
                {book.subtitle}
              </p>
            ) : null}
            <p className="text-base leading-relaxed text-slate-300">
              {book.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>{book.chapters.length} Chapters</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>
                {book.chapters.reduce(
                  (total, chapter) => total + chapter.topics.length,
                  0,
                )}{' '}
                Topics
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span>
                Last updated {new Date(book.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        <section className="flex-1 bg-slate-950/90 px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-4xl space-y-6">
            {book.chapters.map((chapter, index) => (
              <article
                key={chapter._id}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-[1px]"
              >
                <div className="relative rounded-[26px] bg-slate-950/90 p-8">
                  <div className="absolute -left-24 top-0 h-full w-24 bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.15)] to-transparent blur-xl" />
                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-inner">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <header className="mb-4">
                        <h2 className="text-2xl font-semibold text-white">
                          {chapter.title}
                        </h2>
                        {chapter.synopsis ? (
                          <p className="mt-2 text-sm text-slate-300">
                            {chapter.synopsis}
                          </p>
                        ) : null}
                        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-cyan-200">
                          {chapter.topics.length} Topics
                        </div>
                      </header>
                      <div className="space-y-4">
                        {chapter.topics.map((topic) => (
                          <div
                            key={topic._id}
                            className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                          >
                            <h3 className="text-lg font-semibold text-white">
                              {topic.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">
                              {topic.content}
                            </p>
                          </div>
                        ))}
                        {chapter.topics.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 p-4 text-sm text-slate-400">
                            Topics for this chapter are coming soon. Check back shortly.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {book.chapters.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-300">
                The curator has not published any chapters yet for this title.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
