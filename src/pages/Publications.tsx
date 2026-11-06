import { useThemes } from '../data/useContent';
import { Link, useSearchParams } from 'react-router-dom';
import { Hero, PageMeta } from '../components/Shared';
import { Icon } from '../components/Icons';
import { site } from '../data/content';
import { useContent, ContentStatus } from '../data/useContent';

export function Publications() {
  const { data: themes } = useThemes();
  const content = useContent('publications');
  const publications = content.data;
  const currentYear = new Date().getFullYear();
  const earlierYear = currentYear - 2;
  const yearOptions = [['all', 'All'], [String(currentYear), String(currentYear)], [String(currentYear - 1), String(currentYear - 1)], ['earlier', `earlier`]];
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const year = params.get('year') ?? 'all';
  const theme = params.get('theme') ?? 'all';
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };
  const queryText = query.trim().toLocaleLowerCase();
  const results = publications.filter(p => {
    const searchText = [p.title, p.authors, p.venue, p.id, p.year].join(' ').toLocaleLowerCase();
    return searchText.includes(queryText) && (year === 'all' || (year === 'earlier' ? p.year <= earlierYear : p.year.toString() === year)) && (theme === 'all' || p.themes.includes(theme));
  });
  const years = [...new Set(results.map(p => p.year))].sort((a, b) => b - a);
  const activeFilters = !!query || year !== 'all' || theme !== 'all';
  if (content.loading || content.error) return <><PageMeta title="Publications" /><Hero title="Publications" compact /><ContentStatus {...content} /></>;
  return <><PageMeta title="Publications" /><Hero title="Publications" subtitle="Research in trustworthy computing and network security." compact />
    <section className="section container publications-page">
      <div className="publication-tools"><div className="search-field"><Icon name="search" /><label className="sr-only" htmlFor="publication-search">Search publications</label><input id="publication-search" type="search" placeholder="Search title, author, or keyword" value={query} onChange={e => setFilter('q', e.target.value)} /></div>
        <div className="year-filters" role="group" aria-label="Publication year">{yearOptions.map(([value, label]) => <button type="button" key={value} aria-pressed={year === value} onClick={() => setFilter('year', value)}>{label}</button>)}</div>
      </div>
      <div className="publication-refinement"><div className="theme-select"><label htmlFor="theme-filter">Research theme</label><select id="theme-filter" value={theme} onChange={e => setFilter('theme', e.target.value)}><option value="all">All themes</option>{themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}{theme !== 'all' && !themes.some(t => t.id === theme) && <option value={theme}>Unknown theme</option>}</select></div><span className="result-count" role="status" aria-live="polite">{results.length} {results.length === 1 ? 'publication' : 'publications'}</span>{activeFilters && <button type="button" className="clear-filters" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}</div>
      {results.length === 0 ? <div className="empty-state"><h2>No matching publications</h2><p>Try a different title or author, or clear your filters.</p><button className="button" type="button" onClick={() => setParams({}, { replace: true })}>Show all publications</button></div> : years.map(y => <section className="publication-year" key={y} aria-labelledby={`year-${y}`}><div className="year-heading"><h2 id={`year-${y}`}>{y}</h2><span aria-hidden="true" /></div>{results.filter(p => p.year === y).map(p => <article className="publication" key={p.id}><h3>{p.title}</h3><p className="publication-authors">{p.authors}</p><p className="publication-venue">{p.venue}</p><div className="publication-links">{p.paperUrl && <a href={p.paperUrl}><Icon name="file" />Paper<span className="sr-only">: {p.title}</span></a>}{p.codeUrl && <a href={p.codeUrl}><Icon name="code" />Code<span className="sr-only">: {p.title}</span></a>}{p.projectId && <Link to={`/research/${p.projectId}`}>Project details<span className="sr-only">: {p.title}</span></Link>}{!p.paperUrl && <a href={site.profileUrl}>Publication record<span className="sr-only"> on the director’s profile</span></a>}</div></article>)}</section>)}
      <div className="bibliography-note"><h2>Full publication list</h2><p>Explore further work on the director’s academic profile.</p><a className="text-link" href={site.profileUrl}>Browse the director’s publications</a></div>
    </section>
  </>;
}
