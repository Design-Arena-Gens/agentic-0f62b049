'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Book, Reader, SiteSettings, Topic } from '@/lib/data';
import { getAdminPasswordHeaderName } from '@/lib/admin';

interface AdminOverview {
  settings: SiteSettings;
  books: Book[];
  readers: Reader[];
}

interface PendingState {
  message: string;
  tone: 'idle' | 'loading' | 'success' | 'error';
}

const ADMIN_HASH = '#shaun';
const PASSWORD_PLACEHOLDER = 'Shaun2810##';

export default function AdminPanel() {
  const [visible, setVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<PendingState>({
    message: '',
    tone: 'idle',
  });
  const [data, setData] = useState<AdminOverview | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );

  const selectedBook = useMemo(
    () => data?.books.find((book) => book._id === selectedBookId) ?? null,
    [data?.books, selectedBookId],
  );

  const selectedChapter = useMemo(() => {
    if (!selectedBook) return null;
    return (
      selectedBook.chapters.find(
        (chapter) => chapter._id === selectedChapterId,
      ) ?? null
    );
  }, [selectedBook, selectedChapterId]);

  const resetAuth = useCallback(() => {
    setIsAuthenticated(false);
    setAdminSecret('');
    setPassword('');
    setData(null);
    setStatus({ tone: 'idle', message: '' });
  }, []);

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === ADMIN_HASH) {
        setVisible(true);
      } else {
        setVisible(false);
        resetAuth();
      }
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
    };
  }, [resetAuth]);

  const showStatus = useCallback((state: PendingState) => {
    setStatus(state);
    if (state.tone === 'success') {
      setTimeout(() => {
        setStatus((prev) =>
          prev.tone === 'success' ? { tone: 'idle', message: '' } : prev,
        );
      }, 2500);
    }
  }, []);

  const loadOverview = useCallback(
    async (secret: string) => {
      showStatus({ tone: 'loading', message: 'Loading admin data…' });
      try {
        const response = await fetch('/api/admin/overview', {
          headers: {
            [getAdminPasswordHeaderName()]: secret,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to fetch overview');
        }

        const payload = (await response.json()) as AdminOverview;
        setData(payload);
        setStatus({ tone: 'success', message: 'Admin data refreshed' });
        if (payload.books.length) {
          setSelectedBookId(payload.books[0]._id);
          setSelectedChapterId(
            payload.books[0].chapters[0]?._id ?? null,
          );
        }
      } catch (error) {
        console.error(error);
        showStatus({
          tone: 'error',
          message:
            'Failed to load admin data. Check your connection or password.',
        });
      }
    },
    [showStatus],
  );

  const authenticate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!password) {
        showStatus({ tone: 'error', message: 'Password is required.' });
        return;
      }

      if (password !== PASSWORD_PLACEHOLDER) {
        showStatus({ tone: 'error', message: 'Invalid password.' });
        return;
      }

      setIsAuthenticated(true);
      setAdminSecret(password);
      await loadOverview(password);
    },
    [loadOverview, password, showStatus],
  );

  const handleSiteTitleUpdate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data) return;
      const formData = new FormData(event.currentTarget);
      const title = (formData.get('title') as string)?.trim();
      if (!title) {
        showStatus({ tone: 'error', message: 'Title is required.' });
        return;
      }

      try {
        const response = await fetch('/api/admin/site-title', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            [getAdminPasswordHeaderName()]: adminSecret,
          },
          body: JSON.stringify({ title }),
        });
        if (!response.ok) {
          throw new Error('Failed to update title');
        }

        await loadOverview(adminSecret);
        showStatus({
          tone: 'success',
          message: 'Site title updated successfully.',
        });
      } catch (error) {
        console.error(error);
        showStatus({
          tone: 'error',
          message: 'Failed to update site title.',
        });
      }
    },
    [adminSecret, data, loadOverview, showStatus],
  );

  const handleCreateBook = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const payload = {
        title: (formData.get('title') as string)?.trim(),
        subtitle: (formData.get('subtitle') as string)?.trim(),
        description: (formData.get('description') as string)?.trim(),
        accentColor: (formData.get('accentColor') as string)?.trim(),
        coverImage: (formData.get('coverImage') as string)?.trim(),
      };

      if (!payload.title) {
        showStatus({ tone: 'error', message: 'Book title is required.' });
        return;
      }

      try {
        const response = await fetch('/api/admin/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [getAdminPasswordHeaderName()]: adminSecret,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Unable to create book');
        }

        (event.currentTarget as HTMLFormElement).reset();
        await loadOverview(adminSecret);
        showStatus({
          tone: 'success',
          message: 'New book added to your library.',
        });
      } catch (error) {
        console.error(error);
        showStatus({
          tone: 'error',
          message: 'Failed to create book. Try again.',
        });
      }
    },
    [adminSecret, loadOverview, showStatus],
  );

  const handleCreateChapter = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedBookId) {
        showStatus({
          tone: 'error',
          message: 'Select a book before adding chapters.',
        });
        return;
      }

      const formData = new FormData(event.currentTarget);
      const title = (formData.get('chapterTitle') as string)?.trim();
      const synopsis = (formData.get('chapterSynopsis') as string)?.trim();

      if (!title) {
        showStatus({ tone: 'error', message: 'Chapter title is required.' });
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/books/${selectedBookId}/chapters`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [getAdminPasswordHeaderName()]: adminSecret,
            },
            body: JSON.stringify({ title, synopsis }),
          },
        );

        if (!response.ok) {
          throw new Error('Unable to create chapter');
        }

        (event.currentTarget as HTMLFormElement).reset();
        await loadOverview(adminSecret);
        showStatus({
          tone: 'success',
          message: 'Chapter added to the book.',
        });
      } catch (error) {
        console.error(error);
        showStatus({
          tone: 'error',
          message: 'Failed to create chapter.',
        });
      }
    },
    [adminSecret, loadOverview, selectedBookId, showStatus],
  );

  const handleCreateTopic = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedBookId || !selectedChapterId) {
        showStatus({
          tone: 'error',
          message: 'Select a chapter before adding topics.',
        });
        return;
      }

      const formData = new FormData(event.currentTarget);
      const title = (formData.get('topicTitle') as string)?.trim();
      const content = (formData.get('topicContent') as string)?.trim();

      if (!title || !content) {
        showStatus({
          tone: 'error',
          message: 'Topic title and content are both required.',
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/books/${selectedBookId}/chapters/${selectedChapterId}/topics`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [getAdminPasswordHeaderName()]: adminSecret,
            },
            body: JSON.stringify({ title, content }),
          },
        );

        if (!response.ok) {
          throw new Error('Unable to create topic');
        }

        (event.currentTarget as HTMLFormElement).reset();
        await loadOverview(adminSecret);
        showStatus({
          tone: 'success',
          message: 'Topic added into chapter.',
        });
      } catch (error) {
        console.error(error);
        showStatus({
          tone: 'error',
          message: 'Failed to create topic.',
        });
      }
    },
    [
      adminSecret,
      loadOverview,
      selectedBookId,
      selectedChapterId,
      showStatus,
    ],
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-lg">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/90 shadow-2xl">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="to-opacity-50 absolute inset-0 rotate-180 bg-[radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.6),rgba(15,23,42,0.4)),radial-gradient(circle_at_90%_80%,rgba(236,72,153,0.45),rgba(15,23,42,0.35))]" />
        </div>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Command Center
            </h2>
            <p className="text-sm text-slate-300">
              Master your library&apos;s knowledge architecture.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/10"
            onClick={() => {
              window.location.hash = '';
              resetAuth();
            }}
          >
            Exit
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-white">
            <form
              className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              onSubmit={authenticate}
            >
              <label className="text-sm font-medium uppercase tracking-[0.2em] text-slate-200">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Enter control key"
                autoFocus
              />
              <button
                type="submit"
                className="mt-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:shadow-blue-500/40"
              >
                Unlock Panel
              </button>
              {status.message ? (
                <p
                  className={`text-sm ${
                    status.tone === 'error'
                      ? 'text-rose-300'
                      : status.tone === 'success'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }`}
                >
                  {status.message}
                </p>
              ) : null}
            </form>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 text-slate-100">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <header className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      Site Identity
                    </h3>
                    <p className="text-xs text-slate-300">
                      Adjust brand tone, voice, and entrance banner.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-cyan-500/20 px-4 py-1 text-xs uppercase tracking-wide text-cyan-100"
                    onClick={() => loadOverview(adminSecret)}
                  >
                    Refresh
                  </button>
                </header>

                <form
                  className="flex flex-col gap-3"
                  onSubmit={handleSiteTitleUpdate}
                >
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Masthead Title
                  </label>
                  <input
                    name="title"
                    defaultValue={data?.settings.siteTitle ?? ''}
                    className="rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-base text-white transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
                  />
                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-lg shadow-emerald-400/30 transition hover:shadow-cyan-400/40"
                  >
                    Save Identity
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <header className="mb-4">
                  <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Readers Pulse
                  </h3>
                  <p className="text-xs text-slate-300">
                    Live snapshot of avid readers joining your knowledge nexus.
                  </p>
                </header>
                <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
                  {data?.readers?.length ? (
                    data.readers.map((reader) => (
                      <article
                        key={reader._id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 px-4 py-3 text-sm text-white"
                      >
                        <span className="font-medium">{reader.name}</span>
                        <time className="text-xs text-slate-300">
                          {new Date(reader.createdAt).toLocaleString()}
                        </time>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm text-slate-300">
                      No registered readers yet. Invite explorers to your realm.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Library Blueprint
                  </h3>
                  <p className="text-xs text-slate-300">
                    Craft immersive books with nested chapters and topics.
                  </p>
                </div>
              </header>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <form
                    className="grid gap-3 rounded-2xl border border-white/5 bg-slate-900/40 p-5"
                    onSubmit={handleCreateBook}
                  >
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                      Add New Book
                    </h4>
                    <input
                      name="title"
                      placeholder="Book title"
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <input
                      name="subtitle"
                      placeholder="Subtitle or tagline"
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <textarea
                      name="description"
                      placeholder="Describe the experience readers can expect"
                      rows={3}
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        name="accentColor"
                        placeholder="#38bdf8"
                        className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                      />
                      <input
                        name="coverImage"
                        placeholder="Cover image URL (optional)"
                        className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-fuchsia-500/20 transition hover:shadow-indigo-500/30"
                    >
                      Add Book
                    </button>
                  </form>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">
                      Existing Books
                    </h4>
                    <div className="space-y-3">
                      {data?.books?.length ? (
                        data.books.map((book) => (
                          <details
                            key={book._id}
                            className={`group rounded-2xl border border-white/5 bg-slate-900/40 p-5 transition ${
                              selectedBookId === book._id
                                ? 'border-cyan-400/60'
                                : ''
                            }`}
                            open={selectedBookId === book._id}
                          >
                            <summary
                              className="flex cursor-pointer list-none items-center justify-between text-left text-white"
                              onClick={(event) => {
                                event.preventDefault();
                                setSelectedBookId((current) =>
                                  current === book._id ? null : book._id,
                                );
                                setSelectedChapterId(
                                  book.chapters[0]?._id ?? null,
                                );
                              }}
                            >
                              <span>
                                <span className="text-base font-semibold">
                                  {book.title}
                                </span>
                                {book.subtitle ? (
                                  <span className="ml-2 text-sm text-slate-300">
                                    {book.subtitle}
                                  </span>
                                ) : null}
                              </span>
                              <span className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                                {book.chapters.length} chapters
                              </span>
                            </summary>
                            <div className="mt-4 space-y-3 text-sm text-slate-200">
                              <p>{book.description}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
                                  Accent
                                  <span
                                    className="h-3 w-3 rounded-full border border-white/20"
                                    style={{
                                      backgroundColor:
                                        book.accentColor ?? '#22d3ee',
                                    }}
                                  />
                                </span>
                                <time>
                                  Updated{' '}
                                  {new Date(book.updatedAt).toLocaleString()}
                                </time>
                              </div>
                              {book.chapters?.length ? (
                                <div className="space-y-3">
                                  {book.chapters.map((chapter) => (
                                    <button
                                      type="button"
                                      key={chapter._id}
                                      className={`w-full rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-cyan-400/80 hover:bg-cyan-400/10 ${
                                        selectedChapterId === chapter._id
                                          ? 'border-cyan-400/80 bg-cyan-400/10'
                                          : ''
                                      }`}
                                      onClick={() => {
                                        setSelectedBookId(book._id);
                                        setSelectedChapterId(chapter._id);
                                      }}
                                    >
                                      <span className="font-semibold text-white">
                                        {chapter.title}
                                      </span>
                                      {chapter.synopsis ? (
                                        <p className="mt-1 text-xs text-slate-300">
                                          {chapter.synopsis}
                                        </p>
                                      ) : null}
                                      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
                                        {chapter.topics.length} topics
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">
                                  No chapters yet. Architect the journey using
                                  the panel on the right.
                                </p>
                              )}
                            </div>
                          </details>
                        ))
                      ) : (
                        <p className="text-sm text-slate-300">
                          No books yet. Start by crafting a new experience.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <form
                    className="space-y-3 rounded-2xl border border-white/5 bg-slate-900/40 p-5"
                    onSubmit={handleCreateChapter}
                  >
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                      Add Chapter to Selected Book
                    </h4>
                    <input
                      name="chapterTitle"
                      placeholder="Chapter title"
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <textarea
                      name="chapterSynopsis"
                      placeholder="What does this chapter cover?"
                      rows={3}
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 shadow-lg shadow-emerald-400/30 transition hover:shadow-emerald-400/40"
                    >
                      Create Chapter
                    </button>
                  </form>

                  <form
                    className="space-y-3 rounded-2xl border border-white/5 bg-slate-900/40 p-5"
                    onSubmit={handleCreateTopic}
                  >
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                      Add Topic to Selected Chapter
                    </h4>
                    <input
                      name="topicTitle"
                      placeholder="Topic title"
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                    <textarea
                      name="topicContent"
                      placeholder="Detailed knowledge drop"
                      rows={4}
                      className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/50"
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-400 via-pink-500 to-rose-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-fuchsia-500/30 transition hover:shadow-rose-500/40"
                    >
                      Create Topic
                    </button>
                  </form>

                  <section className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
                      Chapter Outline
                    </h4>
                    {selectedChapter ? (
                      <ul className="mt-3 space-y-3 text-sm text-slate-200">
                        {selectedChapter.topics.map((topic: Topic) => (
                          <li
                            key={topic._id}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <p className="font-semibold text-white">
                              {topic.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-300">
                              {topic.content}
                            </p>
                          </li>
                        ))}
                        {selectedChapter.topics.length === 0 ? (
                          <li className="text-xs text-slate-400">
                            No topics yet. Amplify this chapter with detailed
                            topics.
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      <p className="mt-3 text-xs text-slate-400">
                        Select a chapter from the books list to inspect its
                        agenda.
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </section>

            {status.message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  status.tone === 'success'
                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                    : status.tone === 'error'
                    ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                    : 'border-white/10 bg-white/5 text-white'
                }`}
              >
                {status.message}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
