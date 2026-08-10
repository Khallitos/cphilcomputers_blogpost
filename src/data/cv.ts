export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
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
      "Built a multi-tenant SaaS platform with role-based access control, REST APIs, JWT authentication, and AES encryption.",
      "Delivered an asset-tracking system with thorough documentation and performance testing.",
    ],
  },
  {
    role: "IT Support Technician (Executive)",
    company: "Marshall Oil and Gas Services",
    location: "Takoradi, Ghana",
    period: "May 2021 – Jul 2024",
    bullets: [
      "Ran Intune/Entra ID device management: enrollment, compliance policies, conditional access, MFA, and app deployment.",
      "Administered the M365 tenant — Exchange Online, SharePoint, Teams, OneDrive, and licensing.",
      "Owned user onboarding/offboarding workflows end-to-end under Intune and M365.",
      "Maintained UPS systems, PLC racks, I/O modules, and SCADA monitoring with zero incidents.",
      "Managed multi-site LANs: firewalls, Active Directory, and group policies.",
      "Linked remote sites via Ubiquiti EdgeMAX point-to-point radio links and fiber-optic cabling.",
      "Supported IP cameras, printers, and peripherals; climbed towers for antenna installations.",
      "Ran security audits and shaped data-protection policies.",
      "Managed the IT procurement budget and vendor/SLA relationships.",
      "Wrote SOPs and MOC documentation; trained 20+ staff.",
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
