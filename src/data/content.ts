/** Public content, checked against the source links on 2026-10-04.
 * Site settings, themes, and research descriptions are configured here.
 * The content arrays below are the original reference data; public pages now
 * fetch news, people, and publications from MongoDB through the backend API.
 */
export const site = {
  name: 'FOCUS',
  fullName: 'Fortified Operational Cybersecurity Unified Systems',
  university: 'University of Manitoba',
  department: 'Department of Computer Science',
  email: 'azadeh.tabiban@umanitoba.ca',
  director: 'Dr. Azadeh Tabiban',
  profileUrl: 'https://azadeht.github.io/',
  labSourceUrl: 'https://sites.google.com/view/focusresearch',
  admissionsUrl: 'https://umanitoba.ca/science/computer-science/graduate-programs-application-info',
  interestFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdFX1XZh8LTzpguhUn5Sa9Fo0NIpPr10z3HdL-kjAwezG2mHw/viewform',
  universityUrl: 'https://umanitoba.ca/',
};

export interface Theme {
  id: string;
  name: string;
  icon: string;
  description: string;
}
export const themes: Theme[] = [
  {
    "id": "evasion",
    "name": "Evasion attacks and robust security",
    "icon": "ai",
    "description": "Studying evasion attacks and building resilient security systems."
  },
  {
    "id": "network",
    "name": "Network security",
    "icon": "network",
    "description": "Protecting interconnected systems and telecommunications networks."
  },
  {
    "id": "ai",
    "name": "Machine learning applied to security",
    "icon": "ai",
    "description": "Applying machine learning to detect threats and improve security."
  },
  {
    "id": "provenance",
    "name": "Provenance analysis and forensics",
    "icon": "provenance",
    "description": "Connecting system activity and evidence to investigate security incidents."
  },
  {
    "id": "cloud",
    "name": "Cloud/edge security",
    "icon": "cloud",
    "description": "Securing distributed cloud and edge computing infrastructure."
  }
];

export const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;

export interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  themes: string[];
  paperUrl?: string;
  codeUrl?: string;
  projectId?: string;
}
export const publications: Publication[] = [
  {
    id: 'contorter',
    title: 'A Context is Worth a Thousand Lies: Evading Intrusion Detectors via Intelligent Context Distortion',
    authors: 'Magdy Nasr, Vansh Rastogi, Azadeh Tabiban',
    year: 2026,
    venue: 'IEEE Symposium on Security and Privacy',
    themes: ['provenance', 'ai'],
    paperUrl: 'https://azadeht.github.io/papers/Contorter_sp26.pdf',
    codeUrl: 'https://github.com/focusResearchLab/Contorter',
    projectId: 'contorter',
  },
  {
    id: 'contexts',
    title: 'CONnecting The EXtra doTS (CONTEXTS): Correlating External Information about Point of Interest for Attack Investigation',
    authors: 'Sareh Mohammadi, Hugo Kermabon-Bobinnec, Azadeh Tabiban, Lingyu Wang, Tomás Navarro Múnera, Yosr Jarraya',
    year: 2025,
    venue: 'IEEE Symposium on Security and Privacy',
    themes: ['provenance'],
    paperUrl: 'https://azadeht.github.io/papers/CONTEXTS-sp25.pdf',
    projectId: 'contexts',
  },
  {
    id: 'substations',
    title: 'Measuring and Improving the Security Posture of IEC 61850 Substations against Supply Chain Attacks',
    authors: 'Onur Duman, Azadeh Tabiban, Lingyu Wang, Mourad Debbabi',
    year: 2024,
    venue: 'IEEE Transactions on Instrumentation and Measurement',
    themes: ['network'],
  },
  {
    id: 'oran',
    title: 'Signaling Storm in O-RAN: Challenges and Research Opportunities',
    authors: 'Azadeh Tabiban, Hyame Assem Alameddine, Mohammad A. Salahuddin, Raouf Boutaba',
    year: 2023,
    venue: 'IEEE Communications Magazine',
    themes: ['network'],
  },
  {
    id: 'provtalk',
    title: 'ProvTalk: Towards Interpretable Multi-level Provenance Analysis in Networking Functions Virtualization (NFV)',
    authors: 'Azadeh Tabiban, Heyang Zhao, Yosr Jarraya, Makan Pourzandi, Mengyuan Zhang, Lingyu Wang',
    year: 2022,
    venue: 'Network and Distributed System Security Symposium (NDSS)',
    themes: ['provenance', 'cloud'],
  },
];

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  summary: string;
  question: string;
  approach: string;
  publicationId: string;
  themeIds: string[];
}
export const projects: Project[] = [
  {
    id: 'contorter', name: 'Contorter',
    subtitle: 'Evading intrusion detectors via intelligent context distortion',
    summary: 'Evasion of provenance-based intrusion detection systems.',
    question: 'How can changes to surrounding context expose blind spots in intrusion detection?',
    approach: 'Contorter studies adversarial context in provenance-based detection. The work examines how the relationships around system events can influence a detector’s interpretation.',
    publicationId: 'contorter', themeIds: ['provenance', 'ai'],
  },
  {
    id: 'contexts', name: 'CONTEXTS',
    subtitle: 'Correlating external information for attack investigation',
    summary: 'Connecting external evidence with system provenance.',
    question: 'How can information beyond a detected incident help focus an investigation?',
    approach: 'CONTEXTS brings external information into provenance analysis, connecting evidence about an incident to the system events under investigation.',
    publicationId: 'contexts', themeIds: ['provenance'],
  },
];

export interface Person {
  id: string;
  name: string;
  role: string;
  group: 'director' | 'graduate' | 'undergraduate' | 'alumni' | 'friends';
  detail?: string;
  /** Optional image path relative to public/assets, e.g. people/magdy.jpg. */
  image?: string;
  profileUrl?: string;
}
export const people: Person[] = [
  { id: 'azadeh', name: 'Dr. Azadeh Tabiban', role: 'Lab director', group: 'director', detail: 'Assistant Professor, University of Manitoba', profileUrl: site.profileUrl },
  { id: 'magdy', name: 'Magdy Nasr', role: 'MSc researcher', group: 'graduate' },
  { id: 'yousef', name: 'Yousef Mahmoud', role: 'MSc researcher', group: 'graduate' },
  { id: 'neveen', name: 'Neveen Ayman', role: 'MSc researcher', group: 'graduate' },
  { id: 'vansh', name: 'Vansh Rastogi', role: 'Undergraduate researcher', group: 'undergraduate' },
  { id: 'sareh', name: 'Sareh Mohammadi', role: 'Former PhD student', group: 'alumni', detail: 'Concordia University, co-advised with Dr. Lingyu Wang' },
  { id: 'hrutil', name: 'Hrutil Patel', role: 'Former undergraduate researcher', group: 'alumni' },
  { id: 'hayley', name: 'Hayley Kirkup', role: 'Former undergraduate researcher', group: 'alumni' },
];

export interface NewsItem {
  id: string;
  /** Month precision avoids inventing exact announcement dates. */
  date: string;
  title: string;
  summary: string;
  paragraphs: string[];
  publicationId?: string;
  sourceUrl: string;
}
export const news: NewsItem[] = [
  {
    id: 'sp-2026', date: '2026-03', title: 'FOCUS research accepted at IEEE S&P 2026',
    summary: 'Research on evading intrusion detectors through intelligent context distortion.',
    paragraphs: [
      'The paper “A Context is Worth a Thousand Lies” was accepted at the 2026 IEEE Symposium on Security and Privacy.',
      'Magdy Nasr, Vansh Rastogi and Azadeh Tabiban investigate adversarial context in intrusion detection. Their framework, Contorter, examines how context can expose weaknesses in provenance-based detectors.',
      'The publication and public code provide the full method and evaluation.',
    ], publicationId: 'contorter', sourceUrl: site.labSourceUrl,
  },
  {
    id: 'urgp-2025', date: '2025-02', title: 'URGP funding for intrusion detection research',
    summary: 'Support for research on AI-based detection against AI-equipped attackers.',
    paragraphs: ['The University Research Grants Program (URGP) is supporting FOCUS research on intrusion detection against attackers that use AI.', 'The lab announced the funding in February 2025.'],
    sourceUrl: site.labSourceUrl,
  },
  {
    id: 'nserc-2024', date: '2024-03', title: 'NSERC Discovery Grant supports provenance research',
    summary: 'Funding for provenance research in interconnected intelligent systems.',
    paragraphs: ['An NSERC Discovery Grant supports the lab’s work on scalable, reliable and robust provenance in interconnected intelligent systems.', 'The lab announced the grant in March 2024.'],
    sourceUrl: site.labSourceUrl,
  },
  {
    id: 'oran-2023', date: '2023-12', title: 'O-RAN research in IEEE Communications Magazine',
    summary: 'Research on signaling storms in open radio access networks.',
    paragraphs: ['“Signaling Storm in O-RAN: Challenges and Research Opportunities” appeared in IEEE Communications Magazine.', 'The work considers signaling storms in open radio access networks. The lab shared the publication update in December 2023.'],
    publicationId: 'oran', sourceUrl: site.labSourceUrl,
  },
];

export function formatMonth(date: string) {
  return new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}-01T12:00:00Z`));
}
