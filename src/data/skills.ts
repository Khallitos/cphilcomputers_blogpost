export type SkillGroup = {
  group: string;
  skills: string[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    group: "Data Center & Infra",
    skills: [
      "UPS",
      "PLC racks",
      "SCADA/BMS",
      "Structured cabling",
      "Fiber optics",
      "Rack mounting",
      "FRU maintenance",
    ],
  },
  {
    group: "Hardware Repairs & Maintenance",
    skills: [
      "Repairing of computer hardware",
      "UPS systems",
      "PLC racks",
      "I/O modules",
      "Check scanner hardware",
      "Structured cabling",
      "Fiber optic installation",
      "Rack mounting",
      "FRU replacement",
    ],
  },
  {
    group: "Microsoft Endpoint & Cloud",
    skills: [
      "Intune",
      "Entra ID",
      "M365",
      "Defender for Endpoint",
      "Active Directory",
      "Onboarding/offboarding",
    ],
  },
  {
    group: "Networking",
    skills: [
      "TCP/IP",
      "DNS/DHCP",
      "LAN/WAN",
      "VPN",
      "FortiGate",
      "Sophos",
      "Switches & routers",
      "Ubiquiti EdgeMAX",
      "Group policies",
    ],
  },
  {
    group: "Virtualization",
    skills: ["VMware ESXi", "vCenter"],
  },
  {
    group: "Operating Systems",
    skills: ["Ubuntu", "CentOS/RHEL", "Windows Server 2016–2022", "macOS"],
  },
  {
    group: "Security",
    skills: [
      "Security audits",
      "Vulnerability scanning",
      "SIEM",
      "Incident response",
      "ISO 27001",
      "NIST",
      "OWASP",
      "IAM",
      "Encryption",
    ],
  },
  {
    group: "AI & Automation",
    skills: ["Power Automate", "n8n", "Hermes Agent"],
  },
  {
    group: "Development",
    skills: [
      "PowerShell",
      "Bash",
      "Python",
      "JavaScript",
      "PHP",
      "React.js",
      "Node.js",
      "Express.js",
      "Vue/Nuxt.js",
      "MERN",
    ],
  },
  {
    group: "Databases",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    group: "Cloud & VCS",
    skills: ["AWS", "Git", "GitHub", "GitLab", "Bitbucket"],
  },
  {
    group: "Soft Skills",
    skills: [
      "Security awareness",
      "Vendor coordination",
      "Problem-solving",
      "Technical documentation",
      "Teamwork",
      "Training & mentoring",
    ],
  },
];
