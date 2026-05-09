// Articles list page

function QRArticles() {
  const [tag, setTag] = React.useState('all');
  const tags = ['all', ...new Set(window.QRPosts.map(p => p.tag))];
  const posts = tag === 'all' ? window.QRPosts : window.QRPosts.filter(p => p.tag === tag);

  return (
    <>
      <QRTopNav active="articles"/>
      <section className="max-w-[1200px] mx-auto px-6 pt-14 pb-10 border-b hairline">
        <div className="mono text-[10.5px] uppercase tracking-[.18em] text-[var(--ink-faint)] mb-3">artykuły</div>
        <h1 className="serif text-[56px] md:text-[72px] leading-[0.95] tracking-[-0.025em]">
          Notatki z drogi.
        </h1>
        <p className="text-[15px] text-[var(--ink-dim)] mt-5 max-w-[60ch] leading-relaxed">
          Backtesty, błędy, kalkulacje kosztów i ślepe uliczki. Wszystko, co składa się na strategię — zanim trafi do symulatora.
        </p>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {tags.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={`px-3 py-1.5 rounded-full text-[12px] mono uppercase tracking-wider transition border
                ${tag === t
                  ? 'bg-[var(--bg-3)] text-[var(--ink)] border-[var(--line-2)]'
                  : 'bg-transparent text-[var(--ink-mute)] hover:text-[var(--ink)] border-[var(--line)]'}`}>
              {t === 'all' ? 'wszystkie' : t.toLowerCase()}
            </button>
          ))}
          <span className="ml-auto mono text-[10.5px] uppercase tracking-[.14em] text-[var(--ink-faint)]">
            {posts.length} {posts.length === 1 ? 'artykuł' : posts.length < 5 ? 'artykuły' : 'artykułów'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(p => <PostCard key={p.slug} post={p}/>)}
        </div>
      </section>

      <QRFooter/>
    </>
  );
}

window.QRArticles = QRArticles;
