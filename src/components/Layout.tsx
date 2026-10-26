import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { site } from '../data/content';

const navigation = [['Research', '/research'], ['People', '/people'], ['Publications', '/publications'], ['News', '/news'], ['Join us', '/join'], ['Admin', '/admin']] as const;

export function Wordmark() {
  return <Link className="brand" to="/" aria-label="FOCUS research lab home">
    <span className="wordmark">F<span>O</span>CUS</span>
    <span className="brand-description"><strong>Research lab</strong><span>{site.department}</span></span>
  </Link>;
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const firstVisit = useRef(true);
  useEffect(() => {
    setMenuOpen(false);
    // Preserve scroll and focus while changing publication filters on the same page.
    window.scrollTo(0, 0);
    if (!firstVisit.current) main.current?.focus({ preventScroll: true });
    firstVisit.current = false;
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  return <>
    <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <header className="site-header">
      <div className="container header-inner">
        <Wordmark />
        <button ref={menuButton} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <span>{menuOpen ? 'Close' : 'Menu'}</span><Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <nav id="primary-navigation" className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navigation.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
          <Link className="nav-search" to="/publications" aria-label="Search publications" onClick={() => setMenuOpen(false)}><Icon name="search" /></Link>
        </nav>
      </div>
    </header>
    <main id="main-content" ref={main} tabIndex={-1}><Outlet /></main>
    <footer className="site-footer"><div className="container footer-top"><Wordmark /><nav aria-label="Footer navigation">{navigation.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}<Link to="/contact">Contact</Link></nav></div>
      <div className="container footer-bottom"><a href={site.universityUrl}>{site.university}</a><span>{site.department} · Winnipeg, Canada</span><span>© {new Date().getFullYear()} FOCUS Lab</span></div>
    </footer>
  </>;
}
