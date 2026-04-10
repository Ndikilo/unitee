const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add import if missing
if (!c.includes('CertificateTemplatesTab')) {
  c = c.replace(
    "import DashboardLayout from '@/components/DashboardLayout';",
    "import DashboardLayout from '@/components/DashboardLayout';\nimport CertificateTemplatesTab from '@/components/admin/CertificateTemplatesTab';"
  );
}

// 2. Add Templates trigger after Certificates trigger
if (!c.includes('cert-templates')) {
  c = c.replace(
    '<TabsTrigger value="certificates">Certificates</TabsTrigger>',
    '<TabsTrigger value="certificates">Certificates</TabsTrigger>\n          <TabsTrigger value="cert-templates">Templates</TabsTrigger>'
  );
  c = c.replace('grid-cols-10', 'grid-cols-11');
}

// 3. Remove stray </TabsContent> that appears right before {/* Badges Tab */}
// and insert CertificateTemplatesTab there
const lines = c.split('\n');
const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip the stray </TabsContent> that comes right before Badges Tab comment
  if (line.trim() === '</TabsContent>' && i + 2 < lines.length && lines[i+2].includes('Badges Tab')) {
    // Replace with the component
    out.push('');
    out.push('        {/* Certificate Templates Tab */}');
    out.push('        <CertificateTemplatesTab />');
    out.push('');
    continue;
  }
  out.push(line);
}
c = out.join('\n');

fs.writeFileSync('src/pages/AdminDashboard.tsx', c, 'utf8');
console.log('Done. Has CertificateTemplatesTab:', c.includes('<CertificateTemplatesTab'));
console.log('Has cert-templates trigger:', c.includes('cert-templates'));
