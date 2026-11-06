import { useThemes } from '../data/useContent';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../components/Layout';
import { PageMeta } from '../components/Shared';
import { projects } from '../data/content';
import './admin.css';

type Section = 'news' | 'people' | 'publications' | 'themes';
type RecordData = Record<string, string | number | string[]> & { id: string; status: string };
type Session = { admin: { email: string }; csrfToken: string };
type Field = { key: string; label: string; required?: boolean; type?: string };
const fields: Record<Section, Field[]> = {
  themes: [{ key: 'name', label: 'Name', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true }, { key: 'icon', label: 'Icon (ai, network, provenance, or cloud)', required: true }],
  news: [{ key: 'title', label: 'Title', required: true }, { key: 'date', label: 'Month', type: 'month', required: true }, { key: 'summary', label: 'Summary', type: 'textarea', required: true }, { key: 'paragraphs', label: 'Article text', type: 'textarea', required: true }, { key: 'sourceUrl', label: 'Source link', required: true }, { key: 'publicationId', label: 'Related publication', type: 'publication' }],
  people: [{ key: 'name', label: 'Name', required: true }, { key: 'role', label: 'Role', required: true }, { key: 'group', label: 'Group', type: 'group', required: true }, { key: 'detail', label: 'Details' }, { key: 'profileUrl', label: 'Profile link' }, { key: 'image', label: 'Photo path (optional)' }],
  publications: [{ key: 'title', label: 'Title', required: true }, { key: 'authors', label: 'Authors', required: true }, { key: 'year', label: 'Year', type: 'number', required: true }, { key: 'venue', label: 'Venue', required: true }, { key: 'themes', label: 'Research themes', type: 'themes', required: true }, { key: 'paperUrl', label: 'Paper link' }, { key: 'codeUrl', label: 'Code link' }, { key: 'projectId', label: 'Related project', type: 'project' }],
};

async function api<T>(path: string, method = 'GET', body?: unknown, csrfToken?: string): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'focus-admin', ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw Object.assign(new Error(result?.error ?? 'Unable to complete the request. Please try again.'), { status: response.status });
  }
  return response.status === 204 ? undefined as T : response.json();
}

export function Admin() {
  const { data: themes, retry: refreshThemes } = useThemes();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState<Section>('news');
  const [records, setRecords] = useState<RecordData[]>([]);
  const [publications, setPublications] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<Record<string, string | string[]>>({});
  const [preview, setPreview] = useState(false);
  const [deleting, setDeleting] = useState<RecordData | null>(null);

  function report(error: unknown) {
    if ((error as { status?: number }).status === 401) {
      setSession(null); setEditing(undefined); setRecords([]);
    }
    setError(error instanceof Error ? error.message : 'Unable to connect to the server.');
  }
  useEffect(() => {
    let active = true;
    api<Session>('/auth/me').then(value => { if (active) setSession(value); }).catch(error => {
      if (active && error.status !== 401) setError('Unable to connect to the server. Start the backend and refresh this page.');
    }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true); setRecords([]);
    Promise.all([api<RecordData[]>(`/admin/${section}`), api<RecordData[]>('/admin/publications')])
      .then(([items, papers]) => { if (active) { setRecords(items); setPublications(papers); } })
      .catch(error => { if (active) report(error); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [section, session]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { setSession(await api<Session>('/auth/login', 'POST', { email, password })); setPassword(''); }
    catch (error) { report(error); }
    finally { setBusy(false); }
  }
  function edit(record?: RecordData) {
    const next: Record<string, string | string[]> = {};
    for (const field of fields[section]) {
      const value = record?.[field.key];
      next[field.key] = field.key === 'themes' ? (Array.isArray(value) ? value : []) :
        field.key === 'paragraphs' && Array.isArray(value) ? value.join('\n\n') : String(value ?? '');
    }
    if (!record) {
      if (section === 'themes') next.icon = 'ai';
      if (section === 'people') next.group = 'graduate';
      if (section === 'publications') next.year = String(new Date().getFullYear());
    }
    setForm(next); setEditing(record?.id ?? null); setPreview(false); setError(''); setNotice('');
  }
  async function save(status: string) {
    if (!session) return;
    const missing = fields[section].filter(field => field.required &&
      (Array.isArray(form[field.key]) ? !(form[field.key] as string[]).length : !String(form[field.key] ?? '').trim()));
    if (missing.length) { setError(`Please fill in: ${missing.map(field => field.label).join(', ')}.`); return; }
    const body: Record<string, unknown> = { ...form, status };
    if (section === 'publications') body.year = Number(form.year);
    if (section === 'news') body.paragraphs = String(form.paragraphs).split(/\n\s*\n/).map(text => text.trim()).filter(Boolean);
    setBusy(true); setError('');
    try {
      await api(`/admin/${section}${editing ? `/${editing}` : ''}`, editing ? 'PATCH' : 'POST', body, session.csrfToken);
      refreshThemes(); setEditing(undefined); setPreview(false); setNotice(status === 'published' ? 'Published successfully.' : 'Draft saved.');
      setRecords(await api<RecordData[]>(`/admin/${section}`));
    } catch (error) { report(error); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!session || !deleting) return;
    setBusy(true); setError('');
    try {
      await api(`/admin/${section}/${deleting.id}`, 'DELETE', undefined, session.csrfToken);
      refreshThemes(); setRecords(items => items.filter(item => item.id !== deleting.id)); setDeleting(null); setNotice('Record deleted.');
    } catch (error) { report(error); }
    finally { setBusy(false); }
  }
  async function logout() {
    if (!session) return;
    setBusy(true); setError('');
    try { await api('/auth/logout', 'POST', undefined, session.csrfToken); setSession(null); setEditing(undefined); setNotice(''); }
    catch (error) { report(error); }
    finally { setBusy(false); }
  }
  const update = (key: string, value: string | string[]) => setForm(current => ({ ...current, [key]: value }));
  return <div className="admin-shell"><PageMeta title="Admin" />
    <header className="admin-header"><Wordmark /><Link to="/">View website</Link>{session && <button disabled={busy} onClick={logout}>Log out</button>}</header>
    <main className="admin-main">
      {error && <div className="admin-error" role="alert">{error}</div>}{notice && <div className="admin-notice" role="status">{notice}</div>}
      {checking ? <p role="status">Checking your session…</p> : !session ? <form className="admin-login" onSubmit={login}>
        <span className="eyebrow">FOCUS administration</span><h1>Welcome back</h1><p>Log in to manage lab content.</p>
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
        <button className="button" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form> : <>
        <div className="admin-title"><div><span className="eyebrow">Content dashboard</span><h1>Manage the lab</h1><p>{session.admin.email}</p></div></div>
        <nav className="admin-tabs" aria-label="Content sections">{(['news', 'people', 'publications', 'themes'] as Section[]).map(name => <button key={name} aria-current={section === name ? 'page' : undefined} disabled={busy} onClick={() => { setSection(name); setEditing(undefined); setDeleting(null); setPreview(false); setError(''); setNotice(''); }}>{name}</button>)}</nav>
        {editing === undefined ? <>
          <div className="admin-list-heading"><h2>{section}</h2><button className="button" disabled={busy || loading} onClick={() => edit()}>Add {section === 'people' ? 'person' : section === 'news' ? 'news' : section === 'themes' ? 'theme' : 'publication'}</button></div>
          {loading ? <p role="status">Loading records…</p> : records.length === 0 ? <div className="admin-empty">No records yet. Add your first entry above.</div> : <div className="admin-records">{records.map(record => <article key={record.id}><div><h3>{String(record.title ?? record.name)}</h3><span className={`admin-status ${record.status}`}>{record.status}</span></div><div className="admin-actions"><button disabled={busy} onClick={() => edit(record)}>Edit</button><button disabled={busy} onClick={() => setDeleting(record)}>Delete</button></div></article>)}</div>}
          {deleting && <div className="admin-delete" role="alert"><p>Delete “{String(deleting.title ?? deleting.name)}”? This cannot be undone.</p><div className="admin-actions"><button disabled={busy} onClick={remove}>Delete record</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></div></div>}
        </> : <form className="admin-editor" onSubmit={event => { event.preventDefault(); void save('published'); }}>
          <h2>{editing ? 'Edit entry' : 'New entry'}</h2>
          <fieldset disabled={busy} className="admin-fields">{fields[section].map(field => field.type === 'themes' ? <fieldset className="admin-themes" key={field.key}><legend>{field.label} *</legend>{themes.map(theme => <label key={theme.id}><input type="checkbox" checked={(form.themes as string[]).includes(theme.id)} onChange={event => update('themes', event.target.checked ? [...form.themes as string[], theme.id] : (form.themes as string[]).filter(id => id !== theme.id))} />{theme.name}</label>)}</fieldset> : <label key={field.key}>{field.label}{field.required ? ' *' : ''}
            {field.type === 'textarea' ? <textarea rows={field.key === 'paragraphs' ? 9 : 3} required={field.required} value={String(form[field.key] ?? '')} onChange={event => update(field.key, event.target.value)} /> : ['group', 'project', 'publication'].includes(field.type ?? '') ? <select required={field.required} value={String(form[field.key] ?? '')} onChange={event => update(field.key, event.target.value)}>
              {!field.required && <option value="">None</option>}
              {field.type === 'group' ? ['director', 'graduate', 'undergraduate', 'alumni', 'friends'].map(group => <option key={group} value={group}>{group === 'friends' ? 'Friends of the Lab (Past & Present)' : group}</option>) : (field.type === 'project' ? projects.map(project => ({ id: project.id, label: project.name })) : publications.map(paper => ({ id: paper.id, label: String(paper.title) }))).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              {form[field.key] && field.type === 'publication' && !publications.some(paper => paper.id === form[field.key]) && <option value={String(form[field.key])}>{String(form[field.key])}</option>}
            </select> : <input type={field.type ?? 'text'} required={field.required} value={String(form[field.key] ?? '')} onChange={event => update(field.key, event.target.value)} />}
            {field.key === 'paragraphs' && <small>Separate paragraphs with a blank line.</small>}
          </label>)}</fieldset>
          <div className="admin-actions"><button className="button" disabled={busy} type="submit">{busy ? 'Saving…' : 'Publish'}</button><button disabled={busy} type="button" onClick={() => save('draft')}>Save draft</button><button type="button" disabled={busy} onClick={() => setPreview(!preview)}>Preview</button><button type="button" disabled={busy} onClick={() => setEditing(undefined)}>Cancel</button></div>
          {preview && <article className="admin-preview"><span className="eyebrow">Preview</span><h2>{String(form.title ?? form.name)}</h2>{section === 'news' ? <><p className="lead">{String(form.summary)}</p>{String(form.paragraphs).split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</> : section === 'people' ? <><p>{String(form.role)}</p><p>{String(form.detail)}</p></> : <><p>{String(form.authors)}</p><p>{String(form.venue)} · {String(form.year)}</p></>}</article>}
        </form>}
      </>}
    </main></div>;
}
