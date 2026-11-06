import { ContentStatus, useThemes } from '../data/useContent';
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { asset } from '../data/content';

export function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = `${title} | FOCUS Research Lab`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? 'FOCUS research lab at the University of Manitoba. Research in cybersecurity and connected computing systems.');
  }, [title, description]);
  return null;
}

export function Hero({ title, subtitle, children, compact = false, breadcrumb }: { title: string; subtitle?: string; children?: ReactNode; compact?: boolean; breadcrumb?: ReactNode }) {
  return <section className={`hero ${compact ? 'hero-compact' : ''}`}>
    <div className="container hero-inner">{breadcrumb && <nav className="breadcrumb" aria-label="Breadcrumb">{breadcrumb}</nav>}
      <span className="accent-line" aria-hidden="true" /><h1>{title}</h1>{subtitle && <p className="hero-subtitle">{subtitle}</p>}{children}
    </div>
  </section>;
}

export function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="section-heading"><span className="accent-line" aria-hidden="true" /><h2>{title}</h2>{children}</div>;
}

export function ResearchThemes({ expanded = false }: { expanded?: boolean }) {
  const content = useThemes();
  const themes = content.data;
  if (content.loading || content.error) return <ContentStatus {...content} />;
  return <div className={`theme-grid ${expanded ? 'theme-grid-expanded' : ''}`}>
    {themes.map(theme => <article className="theme" key={theme.id}>
      <img className="theme-icon" src={asset(`${theme.icon}.png`)} width="76" height="76" alt="" />
      <div><h3>{theme.name}</h3><p>{theme.description}</p><Link className="text-link" to={`/publications?theme=${theme.id}`}>Explore related work<span className="sr-only"> in {theme.name}</span></Link></div>
    </article>)}
  </div>;
}

export function JoinBanner() {
  return <section className="join-banner"><div className="container join-banner-inner"><div><span className="eyebrow">Research with us</span><h2>Bring your curiosity to FOCUS</h2><p>Explore graduate research opportunities in cybersecurity.</p></div><Link className="button button-light" to="/join">Join the lab</Link></div></section>;
}
