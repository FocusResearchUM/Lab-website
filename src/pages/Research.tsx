import { useThemes } from '../data/useContent';
import { Link, useParams } from 'react-router-dom';
import { Hero, PageMeta, ResearchThemes, SectionHeading } from '../components/Shared';
import { projects, type Project } from '../data/content';
import { useContent, ContentStatus } from '../data/useContent';
import { NotFound } from './Utility';

export function ProjectCard({ project }: { project: Project }) {
  return <article className="project-card"><div className={`project-art project-art-${project.id}`} aria-hidden="true" /><div><span className="eyebrow">Selected research</span><h3><Link to={`/research/${project.id}`}>{project.name}</Link></h3><p>{project.summary}</p><Link className="text-link" to={`/research/${project.id}`}>Explore this work<span className="sr-only">: {project.name}</span></Link></div></article>;
}

export function Research() {
  return <><PageMeta title="Research" /><Hero title="Research" subtitle="Security and trust in connected computing systems." compact />
    <section className="section container"><h2 className="sr-only">Research themes</h2><ResearchThemes expanded /></section>
  </>;
}

function ConceptDiagram({ contexts }: { contexts: boolean }) {
  return <figure className="concept-figure"><svg viewBox="0 0 540 280" role="img" aria-labelledby="concept-title concept-description">
    <title id="concept-title">{contexts ? 'Connecting evidence to system activity' : 'Context surrounding system activity'}</title>
    <desc id="concept-description">A conceptual diagram connecting observed activity, contextual information and a security analysis. This is not an experimental result.</desc>
    <g fill="none" stroke="#007f79" strokeWidth="2"><path d="M100 140H240M270 140H435M270 140V60M270 140V220" /><path d="M270 60H390M270 220H390" strokeDasharray="6 6" /></g>
    <g fill="#dcece9" stroke="#007f79"><circle cx="80" cy="140" r="39" /><circle cx="270" cy="140" r="44" /><circle cx="270" cy="60" r="23" /><circle cx="270" cy="220" r="23" /><circle cx="445" cy="140" r="39" /></g>
    <g fill="#10283f" fontFamily="Arial, sans-serif" fontSize="13" textAnchor="middle"><text x="80" y="137">System</text><text x="80" y="155">activity</text><text x="270" y="145">Context</text><text x="445" y="137">Security</text><text x="445" y="155">analysis</text><text x="400" y="64" textAnchor="start">{contexts ? 'External evidence' : 'Relationships'}</text><text x="400" y="224" textAnchor="start">Events</text></g>
  </svg><figcaption>Concept illustration</figcaption></figure>;
}

export function ProjectDetail() {
  const { data: themes } = useThemes();
  const { projectId } = useParams();
  const content = useContent('publications');
  const publications = content.data;
  const project = projects.find(p => p.id === projectId);
  const publication = publications.find(p => p.id === project?.publicationId);
  if (!project) return <NotFound />;
  if (content.loading || content.error) return <><PageMeta title={project.name} /><ContentStatus {...content} /></>;
  if (!publication) return <><PageMeta title={project.name} /><Hero title={project.name} subtitle={project.subtitle} compact /><section className="container section"><p>{project.summary}</p><p>No related publication is currently published.</p></section></>;
  return <><PageMeta title={project.name} description={project.summary} />
    <Hero title={project.name} subtitle={project.subtitle} compact breadcrumb={<><Link to="/research">Research</Link><span aria-hidden="true">/</span><span>{project.name}</span></>}>
      <p className="project-venue">{publication.venue}, {publication.year}</p><div className="hero-actions">{publication.paperUrl && <a className="button" href={publication.paperUrl}>Read paper</a>}{publication.codeUrl && <a className="button button-outline" href={publication.codeUrl}>View code</a>}</div>
    </Hero>
    <section className="section container"><div className="project-detail-grid"><div><SectionHeading title="Research question" /><p className="lead">{project.question}</p><div className="spaced-heading"><SectionHeading title="Approach" /></div><p>{project.approach}</p></div><ConceptDiagram contexts={project.id === 'contexts'} /></div>
      <div className="authors-section"><h2>Authors</h2><p>{publication.authors}</p></div><div className="related-themes"><span>Research themes</span>{themes.filter(t => project.themeIds.includes(t.id)).map(t => <Link key={t.id} className="text-link" to={`/publications?theme=${t.id}`}>{t.name}</Link>)}</div>
    </section>
    <section className="section section-tinted"><div className="container related-publication"><SectionHeading title="Related publication" /><div><h3>{publication.title}</h3><p>{publication.venue} · {publication.year}</p><Link className="text-link" to={`/publications?q=${encodeURIComponent(project.name)}`}>View publication details</Link></div></div></section>
  </>;
}
