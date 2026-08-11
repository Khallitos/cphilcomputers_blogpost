export type SocialLink = {
  label: string;
  href: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type Project = {
  name: string;
  description: string;
  tech: string[];
  href?: string;
};

export const SITE = {
  name: "Carlos Philips",
  url: "https://cphilcomputers.com",
  roleLine:
    "Data Center & Network Engineer · Full-Stack Developer · AI Automation",
  socials: [
    { label: "GitHub", href: "https://github.com/Khallitos" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/carlosphilips66774216a",
    },
    { label: "Instagram", href: "https://instagram.com/carl_philzz" },
    { label: "Email", href: "mailto:carlphil9924@gmail.com" },
  ] satisfies SocialLink[],
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Automation", href: "/#automation" },
  { label: "Blog", href: "/blog" },
  { label: "Playground", href: "/playground" },
  { label: "Contact", href: "/#contact" },
];

export const FEATURED_PROJECTS: Project[] = [
  {
    name: "Time Tracker",
    description:
      "Time-tracking app for teams, built on the MERN stack. Live now.",
    tech: ["MongoDB", "Express", "React", "Node.js"],
    href: "https://timetracker-rho-lyart.vercel.app",
  },
  {
    name: "Multi-Tenant SaaS Platform",
    description:
      "Multi-tenant SaaS platform with RBAC, JWT authentication, and AES-encrypted data.",
    tech: ["RBAC", "JWT", "AES"],
  },
  {
    name: "Menuxer",
    description:
      "Dynamic QR menus for restaurants and cafés — scan, browse, order.",
    tech: ["QR", "React", "Node.js"],
    href: "https://menuxer.com",
  },
];
