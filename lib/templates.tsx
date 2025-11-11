type Template = {
  id: string
  name: string
  pages: PageData[]
}

type PageData = {
  serialNo: string
  title: string
  preview: string
  svgContent: string
  placeholders: string[]
}

// Mock template database
const templates: Record<string, Template> = {
  "certificate-1": {
    id: "certificate-1",
    name: "Professional Certificate",
    pages: [
      {
        serialNo: "1",
        title: "Certificate of Achievement",
        preview: "/formal-certificate.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="w-full h-full">
  <rect width="800" height="600" fill="#f8f9fa"/>
  <rect x="40" y="40" width="720" height="520" fill="white" stroke="#d4af37" stroke-width="8"/>
  <rect x="60" y="60" width="680" height="480" fill="white" stroke="#d4af37" stroke-width="2"/>
  <text x="400" y="150" font-family="serif" font-size="48" font-weight="bold" fill="#2c3e50" text-anchor="middle">CERTIFICATE</text>
  <text x="400" y="200" font-family="serif" font-size="24" fill="#7f8c8d" text-anchor="middle">of Achievement</text>
  <text x="400" y="280" font-family="sans-serif" font-size="20" fill="#34495e" text-anchor="middle">This certifies that</text>
  <text x="400" y="330" font-family="serif" font-size="36" font-weight="bold" fill="#d4af37" text-anchor="middle">{{NAME}}</text>
  <text x="400" y="390" font-family="sans-serif" font-size="18" fill="#34495e" text-anchor="middle">has successfully completed</text>
  <text x="400" y="430" font-family="serif" font-size="24" font-weight="bold" fill="#2c3e50" text-anchor="middle">{{COURSE}}</text>
  <text x="200" y="510" font-family="sans-serif" font-size="16" fill="#7f8c8d" text-anchor="middle">Date: {{DATE}}</text>
  <text x="600" y="510" font-family="sans-serif" font-size="16" fill="#7f8c8d" text-anchor="middle">Instructor: {{INSTRUCTOR}}</text>
</svg>`,
        placeholders: ["NAME", "COURSE", "DATE", "INSTRUCTOR"],
      },
      {
        serialNo: "2",
        title: "Excellence Award",
        preview: "/award-certificate.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="w-full h-full">
  <rect width="800" height="600" fill="#1a202c"/>
  <rect x="40" y="40" width="720" height="520" fill="#2d3748" stroke="#ecc94b" stroke-width="6"/>
  <circle cx="400" cy="180" r="80" fill="#ecc94b" opacity="0.2"/>
  <text x="400" y="200" font-family="serif" font-size="56" font-weight="bold" fill="#ecc94b" text-anchor="middle">★</text>
  <text x="400" y="260" font-family="serif" font-size="40" font-weight="bold" fill="#f7fafc" text-anchor="middle">EXCELLENCE</text>
  <text x="400" y="300" font-family="sans-serif" font-size="20" fill="#cbd5e0" text-anchor="middle">Award Presented To</text>
  <text x="400" y="360" font-family="serif" font-size="38" font-weight="bold" fill="#ecc94b" text-anchor="middle">{{NAME}}</text>
  <text x="400" y="420" font-family="sans-serif" font-size="18" fill="#e2e8f0" text-anchor="middle">In Recognition of Outstanding Performance in</text>
  <text x="400" y="460" font-family="serif" font-size="24" font-weight="bold" fill="#f7fafc" text-anchor="middle">{{CATEGORY}}</text>
  <text x="400" y="520" font-family="sans-serif" font-size="16" fill="#a0aec0" text-anchor="middle">{{DATE}}</text>
</svg>`,
        placeholders: ["NAME", "CATEGORY", "DATE"],
      },
      {
        serialNo: "3",
        title: "Participation Certificate",
        preview: "/participation-certificate.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="w-full h-full">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad1)"/>
  <rect x="60" y="60" width="680" height="480" fill="white" rx="10"/>
  <text x="400" y="140" font-family="sans-serif" font-size="44" font-weight="bold" fill="#667eea" text-anchor="middle">CERTIFICATE</text>
  <text x="400" y="180" font-family="sans-serif" font-size="20" fill="#764ba2" text-anchor="middle">of Participation</text>
  <rect x="300" y="200" width="200" height="3" fill="#667eea"/>
  <text x="400" y="260" font-family="sans-serif" font-size="18" fill="#4a5568" text-anchor="middle">This is to certify that</text>
  <text x="400" y="310" font-family="serif" font-size="36" font-weight="bold" fill="#2d3748" text-anchor="middle">{{NAME}}</text>
  <text x="400" y="360" font-family="sans-serif" font-size="18" fill="#4a5568" text-anchor="middle">has participated in</text>
  <text x="400" y="400" font-family="serif" font-size="26" font-weight="600" fill="#667eea" text-anchor="middle">{{EVENT}}</text>
  <text x="400" y="440" font-family="sans-serif" font-size="16" fill="#718096" text-anchor="middle">on {{DATE}}</text>
  <text x="400" y="490" font-family="sans-serif" font-size="14" fill="#a0aec0" text-anchor="middle">Organized by {{ORGANIZATION}}</text>
</svg>`,
        placeholders: ["NAME", "EVENT", "DATE", "ORGANIZATION"],
      },
    ],
  },
  "invitation-1": {
    id: "invitation-1",
    name: "Event Invitation Pack",
    pages: [
      {
        serialNo: "1",
        title: "Wedding Invitation",
        preview: "/elegant-floral-wedding-invitation.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" class="w-full h-full">
  <rect width="600" height="800" fill="#fff5f5"/>
  <rect x="30" y="30" width="540" height="740" fill="white" stroke="#e5989b" stroke-width="3"/>
  <text x="300" y="120" font-family="serif" font-size="24" fill="#b5838d" text-anchor="middle">You are invited to celebrate</text>
  <text x="300" y="200" font-family="serif" font-size="48" font-weight="bold" fill="#6d6875" text-anchor="middle">The Wedding</text>
  <text x="300" y="250" font-family="serif" font-size="20" fill="#b5838d" text-anchor="middle">of</text>
  <text x="300" y="320" font-family="serif" font-size="40" font-weight="bold" fill="#e5989b" text-anchor="middle">{{BRIDE}}</text>
  <text x="300" y="370" font-family="serif" font-size="32" fill="#b5838d" text-anchor="middle">&</text>
  <text x="300" y="430" font-family="serif" font-size="40" font-weight="bold" fill="#e5989b" text-anchor="middle">{{GROOM}}</text>
  <rect x="200" y="460" width="200" height="2" fill="#e5989b"/>
  <text x="300" y="520" font-family="sans-serif" font-size="20" fill="#6d6875" text-anchor="middle">{{DATE}}</text>
  <text x="300" y="560" font-family="sans-serif" font-size="18" fill="#b5838d" text-anchor="middle">{{TIME}}</text>
  <text x="300" y="620" font-family="sans-serif" font-size="18" fill="#6d6875" text-anchor="middle">{{VENUE}}</text>
  <text x="300" y="680" font-family="sans-serif" font-size="16" fill="#b5838d" text-anchor="middle">{{ADDRESS}}</text>
</svg>`,
        placeholders: ["BRIDE", "GROOM", "DATE", "TIME", "VENUE", "ADDRESS"],
      },
      {
        serialNo: "2",
        title: "Party Invitation",
        preview: "/party-invitation.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" class="w-full h-full">
  <defs>
    <linearGradient id="partyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd60a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fca311;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#partyGrad)"/>
  <circle cx="100" cy="100" r="40" fill="#003566" opacity="0.3"/>
  <circle cx="500" cy="700" r="50" fill="#003566" opacity="0.3"/>
  <circle cx="550" cy="150" r="30" fill="#003566" opacity="0.3"/>
  <rect x="50" y="120" width="500" height="560" fill="white" rx="15"/>
  <text x="300" y="200" font-family="sans-serif" font-size="48" font-weight="bold" fill="#003566" text-anchor="middle">YOU'RE INVITED!</text>
  <text x="300" y="280" font-family="sans-serif" font-size="24" fill="#fca311" text-anchor="middle">Join us for</text>
  <text x="300" y="340" font-family="sans-serif" font-size="36" font-weight="bold" fill="#003566" text-anchor="middle">{{EVENT_NAME}}</text>
  <rect x="200" y="360" width="200" height="3" fill="#fca311"/>
  <text x="300" y="420" font-family="sans-serif" font-size="20" fill="#003566" text-anchor="middle">Date: {{DATE}}</text>
  <text x="300" y="460" font-family="sans-serif" font-size="20" fill="#003566" text-anchor="middle">Time: {{TIME}}</text>
  <text x="300" y="520" font-family="sans-serif" font-size="20" fill="#003566" text-anchor="middle">Location:</text>
  <text x="300" y="560" font-family="sans-serif" font-size="18" fill="#003566" text-anchor="middle">{{LOCATION}}</text>
  <text x="300" y="630" font-family="sans-serif" font-size="16" fill="#666" text-anchor="middle">RSVP to {{CONTACT}}</text>
</svg>`,
        placeholders: ["EVENT_NAME", "DATE", "TIME", "LOCATION", "CONTACT"],
      },
    ],
  },
  "badge-1": {
    id: "badge-1",
    name: "ID Badge Collection",
    pages: [
      {
        serialNo: "1",
        title: "Employee Badge",
        preview: "/employee-id-badge.jpg",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" class="w-full h-full">
  <rect width="400" height="600" fill="#1e3a8a" rx="10"/>
  <rect x="20" y="20" width="360" height="100" fill="#3b82f6" rx="5"/>
  <text x="200" y="60" font-family="sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">{{COMPANY}}</text>
  <text x="200" y="90" font-family="sans-serif" font-size="14" fill="#dbeafe" text-anchor="middle">EMPLOYEE ID</text>
  <rect x="100" y="150" width="200" height="200" fill="#dbeafe" rx="5"/>
  <text x="200" y="380" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">{{NAME}}</text>
  <text x="200" y="420" font-family="sans-serif" font-size="18" fill="#93c5fd" text-anchor="middle">{{POSITION}}</text>
  <text x="200" y="460" font-family="sans-serif" font-size="16" fill="#dbeafe" text-anchor="middle">Department: {{DEPARTMENT}}</text>
  <text x="200" y="500" font-family="mono" font-size="14" fill="#93c5fd" text-anchor="middle">ID: {{EMPLOYEE_ID}}</text>
  <text x="200" y="550" font-family="sans-serif" font-size="12" fill="#60a5fa" text-anchor="middle">Valid Until: {{EXPIRY}}</text>
</svg>`,
        placeholders: ["COMPANY", "NAME", "POSITION", "DEPARTMENT", "EMPLOYEE_ID", "EXPIRY"],
      },
      {
        serialNo: "2",
        title: "Conference Badge",
        preview: "/conference-badge.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" class="w-full h-full">
  <rect width="400" height="600" fill="white"/>
  <rect x="0" y="0" width="400" height="120" fill="#10b981"/>
  <text x="200" y="50" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">{{EVENT}}</text>
  <text x="200" y="85" font-family="sans-serif" font-size="16" fill="#d1fae5" text-anchor="middle">{{DATE}}</text>
  <rect x="50" y="160" width="300" height="250" fill="#f0fdf4" stroke="#10b981" stroke-width="2" rx="10"/>
  <text x="200" y="310" font-family="sans-serif" font-size="32" font-weight="bold" fill="#065f46" text-anchor="middle">{{NAME}}</text>
  <rect x="100" y="330" width="200" height="2" fill="#10b981"/>
  <text x="200" y="370" font-family="sans-serif" font-size="20" fill="#059669" text-anchor="middle">{{ROLE}}</text>
  <text x="200" y="450" font-family="sans-serif" font-size="18" fill="#047857" text-anchor="middle">{{ORGANIZATION}}</text>
  <text x="200" y="520" font-family="mono" font-size="14" fill="#6b7280" text-anchor="middle">Badge #{{BADGE_NUMBER}}</text>
</svg>`,
        placeholders: ["EVENT", "DATE", "NAME", "ROLE", "ORGANIZATION", "BADGE_NUMBER"],
      },
      {
        serialNo: "3",
        title: "Visitor Pass",
        preview: "/visitor-pass.jpg",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" class="w-full h-full">
  <rect width="400" height="600" fill="#fef3c7"/>
  <rect x="20" y="20" width="360" height="560" fill="white" stroke="#f59e0b" stroke-width="4" rx="8"/>
  <rect x="40" y="40" width="320" height="80" fill="#fbbf24" rx="5"/>
  <text x="200" y="75" font-family="sans-serif" font-size="26" font-weight="bold" fill="white" text-anchor="middle">VISITOR PASS</text>
  <text x="200" y="100" font-family="sans-serif" font-size="14" fill="#fffbeb" text-anchor="middle">Temporary Access</text>
  <rect x="100" y="150" width="200" height="200" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="5"/>
  <text x="200" y="390" font-family="sans-serif" font-size="28" font-weight="bold" fill="#92400e" text-anchor="middle">{{NAME}}</text>
  <text x="200" y="430" font-family="sans-serif" font-size="18" fill="#b45309" text-anchor="middle">Visiting: {{HOST}}</text>
  <text x="200" y="470" font-family="sans-serif" font-size="16" fill="#d97706" text-anchor="middle">Company: {{COMPANY}}</text>
  <text x="200" y="510" font-family="sans-serif" font-size="16" fill="#f59e0b" text-anchor="middle">Date: {{DATE}}</text>
  <text x="200" y="550" font-family="mono" font-size="14" fill="#92400e" text-anchor="middle">Pass #{{PASS_NUMBER}}</text>
</svg>`,
        placeholders: ["NAME", "HOST", "COMPANY", "DATE", "PASS_NUMBER"],
      },
      {
        serialNo: "4",
        title: "VIP Access Badge",
        preview: "/vip-badge.png",
        svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" class="w-full h-full">
  <defs>
    <linearGradient id="vipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#vipGrad)"/>
  <rect x="30" y="30" width="340" height="540" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="2" rx="10"/>
  <text x="200" y="100" font-family="serif" font-size="48" font-weight="bold" fill="#fbbf24" text-anchor="middle">★ VIP ★</text>
  <text x="200" y="140" font-family="sans-serif" font-size="18" fill="white" text-anchor="middle">EXCLUSIVE ACCESS</text>
  <rect x="80" y="180" width="240" height="200" fill="white" opacity="0.9" rx="10"/>
  <text x="200" y="410" font-family="serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">{{NAME}}</text>
  <text x="200" y="460" font-family="sans-serif" font-size="20" fill="#fce7f3" text-anchor="middle">{{TITLE}}</text>
  <text x="200" y="510" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle">{{EVENT}}</text>
  <text x="200" y="550" font-family="mono" font-size="14" fill="#fbbf24" text-anchor="middle">VIP-{{CODE}}</text>
</svg>`,
        placeholders: ["NAME", "TITLE", "EVENT", "CODE"],
      },
    ],
  },
}

export async function getTemplateData(templateId: string): Promise<Template> {
  const template = templates[templateId]
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  return template
}

export async function getPageData(templateId: string, serialNo: string): Promise<PageData> {
  const template = await getTemplateData(templateId)
  const page = template.pages.find((p) => p.serialNo === serialNo)
  if (!page) {
    throw new Error(`Page ${serialNo} not found in template ${templateId}`)
  }
  return page
}
