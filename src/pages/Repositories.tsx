import { Hero, PageMeta } from '../components/Shared';
import { useContent, ContentStatus } from '../data/useContent';
export function Repositories() {
const content = useContent('publications'); const papers = content.data.filter(p => p.codeUrl); const repositories = papers.filter((p,i) => papers.findIndex(other => other.codeUrl === p.codeUrl) === i);
return <><PageMeta title="Repositories" /><Hero title="Repositories" subtitle="Code from FOCUS research." compact /><section className="section container">{content.loading || content.error ? <ContentStatus {...content} /> : repositories.length ? repositories.map(p => <article className="publication" key={p.id}><h2>{p.title}</h2><p>{p.authors}</p><a className="text-link" href={p.codeUrl}>View repository</a></article>) : <p>No repositories published yet.</p>}<a className="text-link" href="https://github.com/focusResearchLab">FOCUS Research Lab on GitHub</a></section></>; }
