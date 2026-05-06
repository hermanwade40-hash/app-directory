import {
  categories,
  forumStats,
  getAuthor,
  getCategory,
  moderationReports,
  threads,
  users,
} from './database';

const formatter = new Intl.NumberFormat('en-US');

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {formatter.format(value)}
      </p>
    </div>
  );
}

export default function ForumHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.22),transparent_30%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)]" />
        <header className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.35em] text-cyan-300 uppercase">
              ForumSpace
            </p>
            <h1 className="mt-3 text-4xl leading-tight font-bold text-white md:text-6xl">
              A modern home for community discussion.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Browse categories, start thoughtful threads, help members solve
              problems, and give moderators the tools they need to keep the
              community healthy.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href="#new-thread"
              className="rounded-full bg-cyan-300 px-6 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Start a thread
            </a>
            <a
              href="#categories"
              className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              Browse forums
            </a>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Members" value={forumStats.members} />
          <StatCard label="Online now" value={forumStats.online} />
          <StatCard label="Threads" value={forumStats.threads} />
          <StatCard label="Posts" value={forumStats.posts} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_320px] lg:px-12">
        <div className="space-y-8">
          <section id="categories">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-300 uppercase">
                  Categories
                </p>
                <h2 className="text-2xl font-bold text-white">
                  Find the right room
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                {categories.length} active boards
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50"
                >
                  <div
                    className={`mb-4 h-2 rounded-full bg-gradient-to-r ${category.accent}`}
                  />
                  <h3 className="text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {category.description}
                  </p>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-950/70 p-3">
                      <dt className="text-slate-500">Threads</dt>
                      <dd className="mt-1 font-semibold text-slate-100">
                        {formatter.format(category.threadCount)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 p-3">
                      <dt className="text-slate-500">Posts</dt>
                      <dd className="mt-1 font-semibold text-slate-100">
                        {formatter.format(category.postCount)}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-sm font-semibold text-cyan-300 uppercase">
                Latest activity
              </p>
              <h2 className="text-2xl font-bold text-white">
                Trending conversations
              </h2>
            </div>
            <div className="space-y-3">
              {threads.map((thread) => {
                const category = getCategory(thread.categoryId);
                const author = getAuthor(thread.authorId);

                return (
                  <article
                    key={thread.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {thread.isPinned ? (
                            <span className="rounded-full bg-cyan-300/15 px-2 py-1 font-semibold text-cyan-200">
                              Pinned
                            </span>
                          ) : null}
                          {thread.isLocked ? (
                            <span className="rounded-full bg-amber-300/15 px-2 py-1 font-semibold text-amber-200">
                              Locked
                            </span>
                          ) : null}
                          <span className="text-slate-500">
                            {category?.name} · {thread.lastActivity}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-white">
                          {thread.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                          {thread.excerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {thread.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid min-w-44 grid-cols-3 gap-2 text-center text-xs text-slate-400 md:grid-cols-1 md:text-right">
                        <span>{formatter.format(thread.replies)} replies</span>
                        <span>{formatter.format(thread.views)} views</span>
                        <span>by {author?.displayName}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section
            id="new-thread"
            className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5"
          >
            <h2 className="text-xl font-bold text-white">Create a thread</h2>
            <form className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Title
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white placeholder:text-slate-600"
                  placeholder="What do you want to discuss?"
                />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Category
                <select className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white">
                  {categories.map((category) => (
                    <option key={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Message
                <textarea
                  className="mt-1 min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white placeholder:text-slate-600"
                  placeholder="Write with clarity, kindness, and enough detail."
                />
              </label>
              <button
                type="button"
                className="w-full rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"
              >
                Preview post
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-xl font-bold text-white">Top members</h2>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950">
                    {user.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.role} · {formatter.format(user.reputation)} rep
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-xl font-bold text-white">Moderation queue</h2>
            <div className="mt-4 space-y-3">
              {moderationReports.map((report) => (
                <article key={report.id} className="rounded-xl bg-slate-950/70 p-3">
                  <p className="text-sm font-medium text-white">
                    {report.threadTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.reason} · {report.status}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
