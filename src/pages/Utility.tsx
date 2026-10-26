import { Link } from 'react-router-dom';
import { Hero, PageMeta, SectionHeading } from '../components/Shared';
import { Icon } from '../components/Icons';
import { site } from '../data/content';

export function Join() {
  return <><PageMeta title="Join FOCUS" /><Hero title="Join FOCUS" subtitle="Research opportunities in computing systems and cybersecurity." compact><div className="hero-actions"><a className="button" href={site.interestFormUrl}>Express your interest</a></div></Hero>
    <section className="section container join-page-grid"><div><SectionHeading title="Graduate student" /><h3>PhD and MSc opportunities</h3><p>We welcome students interested in the security of computing systems and networks, including machine learning applied to security.</p><p>Explore our work to find the research questions that interest you, and check current availability with the lab.</p><Link className="text-link" to="/research">Explore research themes</Link></div>
      <div><SectionHeading title="How to apply" /><ol className="application-steps"><li><span className="step-number" aria-hidden="true">1</span><div><h3>Review admission requirements</h3><p>Check the department’s requirements and deadlines for your intended program.</p><a className="text-link" href={site.admissionsUrl}>Admission requirements</a></div></li><li><span className="step-number" aria-hidden="true">2</span><div><h3>Complete the interest form</h3><p>Share your background and research interests through the existing application form.</p><a className="text-link" href={site.interestFormUrl}>Open interest form</a></div></li><li><span className="step-number" aria-hidden="true">3</span><div><h3>Email the director with your transcript</h3><p>After submitting the form, email {site.director} with a copy of your transcript. Follow any additional instructions in the form.</p><a className="text-link email-link" href={`mailto:${site.email}`}>{site.email}</a></div></li></ol></div>
    </section>
  </>;
}
export function Contact() {
  return <><PageMeta title="Contact" /><Hero title="Contact FOCUS" subtitle="Get in touch about research or graduate opportunities." compact />
    <section className="section container"><div className="contact-grid"><div><SectionHeading title={site.director} /><p className="lead">Lab director</p><a className="contact-link" href={`mailto:${site.email}`}><Icon name="mail" /><span>{site.email}</span></a><a className="contact-link" href={site.profileUrl}><Icon name="external" />Faculty profile</a></div><div><SectionHeading title={site.university} /><p className="lead">{site.department}</p><p>Winnipeg, Canada</p><a className="text-link" href={site.universityUrl}>University website</a></div></div><div className="contact-join"><h2>Interested in joining?</h2><Link className="text-link" to="/join">View application information</Link></div></section>
  </>;
}
export function NotFound() {
  return <><PageMeta title="Page not found" /><section className="container not-found"><span className="eyebrow">404</span><h1>Page not found</h1><p>The page you’re looking for may have moved. Explore the lab from the homepage.</p><Link className="button" to="/">Return to FOCUS</Link></section></>;
}
