import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { Research, ProjectDetail } from './pages/Research';
import { People } from './pages/People';
import { Publications } from './pages/Publications';
import { News, NewsDetail } from './pages/News';
import { Join, Contact, NotFound } from './pages/Utility';
import { Admin } from './pages/Admin';

export default function App() {
  return <Routes><Route path="admin" element={<Admin />} /><Route path="admin/login" element={<Admin />} /><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="research" element={<Research />} />
    <Route path="research/:projectId" element={<ProjectDetail />} />
    <Route path="people" element={<People />} />
    <Route path="publications" element={<Publications />} />
    <Route path="news" element={<News />} />
    <Route path="news/:newsId" element={<NewsDetail />} />
    <Route path="join" element={<Join />} />
    <Route path="contact" element={<Contact />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
