import { Hero, PageMeta, SectionHeading } from '../components/Shared';
import { asset, type Person } from '../data/content';
import { useContent, ContentStatus } from '../data/useContent';

function initials(name: string) { return name.replace(/^Dr\.\s*/, '').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join(''); }
function PersonProfile({ person, prominent = false }: { person: Person; prominent?: boolean }) {
  return <article className={`person ${prominent ? 'person-prominent' : ''}`}>
    {person.image ? <img className="avatar" src={asset(person.image)} alt={person.name} width="104" height="104" /> : <div className="avatar" aria-hidden="true">{initials(person.name)}</div>}
    <div><h3>{person.name}</h3><p className="person-role">{person.role}</p>{person.detail && <p className="person-detail">{person.detail}</p>}{person.profileUrl && <a className="text-link" href={person.profileUrl}>Faculty profile</a>}</div>
  </article>;
}
export function People() {
  const content = useContent('people');
  const people = content.data;
  if (content.loading || content.error) return <><PageMeta title="Team" /><Hero title="Team" compact /><ContentStatus {...content} /></>;
  return <><PageMeta title="Team" /><Hero title="Team" subtitle="The FOCUS research team." compact />
    <div className="container people-page"><section className="people-section"><SectionHeading title="Lab director" />{people.filter(p => p.group === 'director').map(p => <PersonProfile person={p} key={p.id} prominent />)}</section>
      <section className="people-section"><SectionHeading title="Graduate researchers" /><div className="people-grid">{people.filter(p => p.group === 'graduate').map(p => <PersonProfile person={p} key={p.id} />)}</div></section>
      <section className="people-section"><SectionHeading title="Undergraduate researchers" /><div className="people-grid">{people.filter(p => p.group === 'undergraduate').map(p => <PersonProfile person={p} key={p.id} />)}</div></section>
      <section className="people-section alumni-section" id="alumni"><SectionHeading title="Alumni" /><div className="people-grid">{people.filter(p => p.group === 'alumni').map(p => <PersonProfile person={p} key={p.id} />)}</div></section>
      <section className="people-section" id="friends"><SectionHeading title="Friends of the Lab (Past & Present)" /><div className="people-grid">{people.filter(p => p.group === 'friends').map(p => <PersonProfile person={p} key={p.id} />)}</div></section>
    </div>
  </>;
}
