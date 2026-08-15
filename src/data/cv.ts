export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
  tags: string[];
};

export type Education = {
  degree: string;
  school: string;
  period: string;
};

/** Work history, newest first. */
export const EXPERIENCE: Experience[] = [
  {
    role: "Full-Stack Web Developer",
    company: "Belzir",
    location: "Berlin, Germany",
    period: "Dec 2024 – Mar 2025",
    bullets: [
      "Developed and maintained clean, efficient code for frontend, backend, and full-stack features.",
      "Designed database schemas, data models, and scalable application workflows.",
      "Built secure RESTful APIs and integrated third-party services with internal systems.",
      "Wrote automated tests, debugged runtime issues, and resolved production bugs to ensure stability.",
      "Conducted peer code reviews to maintain engineering standards, security, and code quality.",
      "Automated build processes and managed CI/CD pipelines for reliable deployments.",
      "Optimized legacy code, updated dependencies, and patched security vulnerabilities to maximize performance.",
      "Documented system architectures, API endpoints, and setup guidelines for cross-functional teams.",
    ],
    tags: ["React", "Node", "RBAC", "JWT", "AES"],
  },
  {
    role: "IT Support Technician (Executive)",
    company: "Marshall Oil and Gas Services",
    location: "Takoradi, Ghana",
    period: "May 2021 – Jul 2024",
    bullets: [
      "Ran Intune/Entra ID device management: enrollment, compliance policies, conditional access, MFA, and app deployment.",
      "Administered the M365 tenant: Exchange Online, SharePoint, Teams, OneDrive, and licensing.",
      "Owned user onboarding/offboarding workflows end-to-end under Intune and M365.",
      "Automated routine IT workflows with PowerShell, Power Automate, and n8n, cutting manual task handling time.",
      "Maintained UPS systems, PLC racks, I/O modules, and SCADA monitoring with zero incidents.",
      "Managed multi-site LANs: firewalls, Active Directory, and group policies.",
      "Linked remote sites via Ubiquiti EdgeMAX point-to-point radio links and fiber-optic cabling.",
      "Supported IP cameras, printers, and peripherals; climbed towers for antenna installations.",
      "Ran security audits and shaped data-protection policies.",
      "Managed the IT procurement budget and vendor/SLA relationships.",
      "Wrote SOPs and MOC documentation; trained 20+ staff.",
    ],
    tags: [
      "Intune",
      "Entra ID",
      "M365",
      "SCADA",
      "Active Directory",
      "FortiGate",
      "Sophos",
      "Fiber",
    ],
  },
  {
    role: "IT Support Specialist / Check Processing System Technician",
    company: "Clydestone",
    location: "Accra, Ghana",
    period: "May 2018 – Apr 2021",
    bullets: [
      "Lead technician for the national check-clearing system across 100+ bank workstations.",
      "Operated GTU data center duties: monitoring, incident response, and escalation.",
      "Performed FRU maintenance and automated rack provisioning.",
      "Resolved 200+ tier-2/3 tickets with a 40% faster average resolution time.",
      "Fixed network faults: IP conflicts, DNS/DHCP issues, and physical-layer problems.",
      "Enforced cybersecurity policies for 50+ users and trained end users.",
    ],
    tags: ["Check clearing", "Data center", "Networking", "Python"],
  },
];

export const EDUCATION: Education[] = [
  {
    degree: "M.Sc. Enterprise and IT Security",
    school: "Offenburg University of Applied Sciences",
    period: "Oct 2025 – present",
  },
  {
    degree: "B.Sc. Information Technology",
    school: "University of Ghana",
    period: "2018",
  },
];