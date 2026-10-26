import { Link } from 'react-router-dom';
import { Hero, JoinBanner, PageMeta, ResearchThemes, SectionHeading } from '../components/Shared';
import { site, formatMonth } from '../data/content';
import { useContent, ContentStatus } from '../data/useContent';

export default function Home() {
  const content = useContent('news');
  const featured = content.data[0];
  return <><PageMeta title="Home" />
    <Hero title="Security research for connected systems" subtitle="Practical research in trustworthy computing and network security.">
      <div className="hero-actions"><Link className="button" to="/research">Explore research</Link><Link className="button button-outline" to="/join">Join the lab</Link></div>
    </Hero>
    <section className="section container"><SectionHeading title="Our research" /><ResearchThemes /></section>
    <section className="section section-tinted"><div className="container latest-grid">
      <SectionHeading title="Latest from FOCUS"><p>Ideas, research, and updates from our lab.</p><Link className="text-link" to="/news">All lab news</Link></SectionHeading>
      {content.loading || content.error ? <ContentStatus {...content} /> : featured ? <article className="home-feature"><div className="feature-image" role="img" aria-label="Abstract illustration of connected systems" /><div className="home-feature-copy"><time className="eyebrow" dateTime={featured.date}>{formatMonth(featured.date)}</time><h3><Link to={`/news/${featured.id}`}>{featured.title}</Link></h3><p>{featured.summary}</p><Link className="text-link" to={`/news/${featured.id}`}>Read the update</Link></div></article> : <p>No updates published yet.</p>}
    </div></section>
    <section className="section container about-grid"><SectionHeading title="A focus on practical security" /><div><p className="lead">We study how connected computing systems can become more transparent and trustworthy.</p><p>Led by {site.director} at the {site.university}, FOCUS brings together researchers working on the security of intelligent systems and networks.</p><Link className="text-link" to="/people">Meet the team</Link></div></section>
    <JoinBanner />
  </>;
}
