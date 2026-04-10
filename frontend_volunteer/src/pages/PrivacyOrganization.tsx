import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyOrganization: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-3xl mx-auto">
      <Link to="/register" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8">
        <ArrowLeft size={16} /> Back to Registration
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-10">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="UNITEE" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold"><span className="text-orange-500">UNI</span><span className="text-blue-600">TEE</span></span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-1">Organization Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026 · Applies to: NGOs, CBOs & Organizations</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>This Privacy Policy explains how UNITEE collects, uses, and protects information provided by organizations registered on the Platform. It also outlines your obligations as an organization regarding the volunteer data you access through UNITEE.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect from Organizations</h2>
            <p><strong>Registration Data:</strong> Organization name, type, description, city, region, website, phone number, and contact person details.</p>
            <p className="mt-2"><strong>Account Credentials:</strong> Contact person's name, email address, and hashed password.</p>
            <p className="mt-2"><strong>Activity Data:</strong> Opportunities posted, applications received, volunteers managed, certificates issued, and platform usage logs.</p>
            <p className="mt-2"><strong>Verification Documents:</strong> If requested during verification, registration certificates or official documents (stored securely and not shared publicly).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Organization Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your organization account and profile.</li>
              <li>To display your organization to volunteers searching for opportunities.</li>
              <li>To process and manage volunteer applications for your opportunities.</li>
              <li>To verify your organization's legitimacy and maintain platform trust.</li>
              <li>To send platform notifications, updates, and administrative communications.</li>
              <li>To generate platform-wide analytics (aggregated, non-identifiable).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Volunteer Data You Access</h2>
            <p>As an organization, you will access volunteer personal data through the Platform. You agree to act as a <strong>data processor</strong> under applicable data protection law and must:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Use volunteer data only for managing volunteer activities on UNITEE.</li>
              <li>Not store volunteer data outside the Platform without explicit written consent from the volunteer.</li>
              <li>Not share volunteer data with third parties, sponsors, or partners without consent.</li>
              <li>Implement appropriate security measures to protect any volunteer data you handle.</li>
              <li>Delete volunteer data when it is no longer needed for the stated purpose.</li>
              <li>Notify UNITEE immediately at <a href="mailto:privacy@unitee.cm" className="text-orange-500 underline">privacy@unitee.cm</a> in the event of a data breach.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Public Organization Profile</h2>
            <p>The following information from your organization profile is publicly visible to all Platform users:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Organization name, type, and description</li>
              <li>City and region</li>
              <li>Website URL</li>
              <li>Verification status</li>
              <li>Posted volunteer opportunities</li>
            </ul>
            <p className="mt-3">Contact person name and phone number are <strong>not</strong> publicly displayed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2>
            <p>UNITEE protects your organization data using:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Encrypted passwords and secure JWT authentication</li>
              <li>HTTPS encryption for all data in transit</li>
              <li>Role-based access control (only your account can manage your organization)</li>
              <li>Regular security audits and rate limiting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
            <p>We retain your organization data for as long as your account is active. Upon account deletion, your organization profile and posted opportunities will be removed within 30 days. Certificate records linked to completed volunteer activities may be retained for verification purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access</strong> — Request a copy of your organization's data held by UNITEE.</li>
              <li><strong>Correction</strong> — Update your organization profile at any time.</li>
              <li><strong>Deletion</strong> — Request full account and data deletion.</li>
              <li><strong>Objection</strong> — Object to specific uses of your data.</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact <a href="mailto:privacy@unitee.cm" className="text-orange-500 underline">privacy@unitee.cm</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Compliance</h2>
            <p>UNITEE operates in compliance with Cameroon's data protection framework and applicable international standards. Organizations operating across borders are responsible for ensuring their own compliance with relevant local data protection laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy-related questions, contact <a href="mailto:privacy@unitee.cm" className="text-orange-500 underline">privacy@unitee.cm</a> — UNITEE Privacy Team, Douala, Cameroon. We respond within 72 hours.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyOrganization;
