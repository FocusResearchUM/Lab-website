import { Link, useParams } from 'react-router-dom';
import { Hero, PageMeta, SectionHeading } from '../components/Shared';
import { formatMonth } from '../data/content';
import { useContent, ContentStatus } from '../data/useContent';
import { NotFound } from './Utility';

export function News() {
  const content = useContent('news');
  if (content.loading || content.error) return <><PageMeta title="News" /><Hero title="News" compact /><ContentStatus {...content} /></>;
  return <><PageMeta title="News" /><Hero title="News" subtitle="Research updates and lab announcements." compact />
    <section className="container news-list" aria-label="Lab news">{content.data.length ? content.data.map(item => <article className="news-row" key={item.id}><time dateTime={item.date}>{formatMonth(item.date)}</time><div><h2><Link to={`/news/${item.id}`}>{item.title}</Link></h2><p>{item.summary}</p></div><Link className="text-link" to={`/news/${item.id}`}>Read update<span className="sr-only">: {item.title}</span></Link></article>) : <p>No updates published yet.</p>}</section>
  </>;
}
export function NewsDetail() {
  const { newsId } = useParams();
  const content = useContent('news');
  const papers = useContent('publications');
  const news = content.data;
  const publications = papers.data;
  if (content.loading || content.error) return <><PageMeta title="News" /><ContentStatus {...content} /></>;
  const item = news.find(n => n.id === newsId);
  if (!item) return <NotFound />;
  const paper = publications.find(p => p.id === item.publicationId);
  return <><PageMeta title={item.title} description={item.summary} /><article className="container section news-detail"><div className="article-body"><nav className="breadcrumb breadcrumb-light" aria-label="Breadcrumb"><Link to="/news">News</Link><span aria-hidden="true">/</span><span>Lab update</span></nav><time className="article-date" dateTime={item.date}>{formatMonth(item.date)}</time><h1>{item.title}</h1><p className="lead">{item.summary}</p><div className="article-copy">{item.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div><div className="article-actions"><Link className="text-link" to="/news">Back to all news</Link><a className="text-link" href={item.sourceUrl}>Original announcement</a></div></div>
      <aside className="article-aside"><div className="article-image" role="img" aria-label="Abstract illustration of a connected network" />{paper ? <div className="related-paper"><span className="eyebrow">Related publication</span><h2>{paper.title}</h2><p>{paper.venue} · {paper.year}</p><Link className="text-link" to={`/publications?q=${encodeURIComponent(paper.id)}`}>View publication</Link></div> : <div className="related-paper"><SectionHeading title="Research at FOCUS" /><p>Explore the questions and projects behind our work.</p><Link className="text-link" to="/research">Explore our research</Link></div>}</aside>
    </article></>;
}
