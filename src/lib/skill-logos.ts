// Official brand logo URLs for skill badges, keyed by exact skill name.
// Prefers the simple-icons CDN. A few brands (Microsoft, PowerShell, AWS)
// were removed from the latest simple-icons set, so those fall back to a
// pinned simple-icons release on jsDelivr that still ships them.
const CDN = "https://cdn.simpleicons.org";
const JSDELIVR = (v: string, slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@${v}/icons/${slug}.svg`;

export const SKILL_LOGO: Record<string, string> = {
  "Power Automate": JSDELIVR("12.4.0", "microsoft"),
  n8n: `${CDN}/n8n`,
  Ubuntu: `${CDN}/ubuntu`,
  PowerShell: JSDELIVR("12.4.0", "powershell"),
  Python: `${CDN}/python`,
  JavaScript: `${CDN}/javascript`,
  PHP: `${CDN}/php`,
  "React.js": `${CDN}/react`,
  "Node.js": `${CDN}/nodedotjs`,
  "Express.js": `${CDN}/express`,
  MySQL: `${CDN}/mysql`,
  PostgreSQL: `${CDN}/postgresql`,
  MongoDB: `${CDN}/mongodb`,
  Redis: `${CDN}/redis`,
  AWS: JSDELIVR("14.15.0", "amazonwebservices"),
  Git: `${CDN}/git`,
  GitHub: `${CDN}/github`,
  GitLab: `${CDN}/gitlab`,
  Bitbucket: `${CDN}/bitbucket`,
};
