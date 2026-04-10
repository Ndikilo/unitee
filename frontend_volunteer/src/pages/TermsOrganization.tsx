import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOrganization: React.FC = () => (
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
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-1">Organization Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026 · Applies to: NGOs, CBOs & Organizations</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By registering an organization account on UNITEE ("Platform"), the authorized representative agrees on behalf of the organization to these Terms of Service. These terms apply exclusively to organizations, NGOs, CBOs, and institutions using UNITEE to recruit and manage volunteers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Organization Eligibility & Verification</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your organization must be a legally registered entity or recognized community group operating in Cameroon or the region.</li>
              <li>You must provide accurate organizational information. False registration details will result in immediate account removal.</li>
              <li>UNITEE reserves the right to verify your organization's legitimacy before granting full platform access.</li>
              <li>The contact person registering must be an authorized representative of the organization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Posting Volunteer Opportunities</h2>
            <p>Organizations agree that all posted opportunities must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be genuine, non-commercial volunteer activities that benefit the community.</li>
              <li>Accurately describe the role, time commitment, location, and requirements.</li>
              <li>Not involve payment requests from volunteers or any form of exploitation.</li>
              <li>Comply with all applicable Cameroonian laws and labor regulations.</li>
              <li>Not promote political parties, religious conversion, or discriminatory practices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Volunteer Management Responsibilities</h2>
            <p>As an organization, you are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing a safe, respectful, and inclusive environment for all volunteers.</li>
              <li>Communicating clearly with accepted volunteers regarding schedules, expectations, and changes.</li>
              <li>Issuing certificates only for verified, completed volunteer work.</li>
              <li>Responding to volunteer applications within a reasonable timeframe (recommended: 5 business days).</li>
              <li>Maintaining accurate records of volunteer participation hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data & Privacy of Volunteers</h2>
            <p>Organizations accessing volunteer profiles and data through UNITEE agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use volunteer data solely for the purpose of managing volunteer activities on the Platform.</li>
              <li>Not share, sell, or transfer volunteer personal data to third parties without explicit consent.</li>
              <li>Comply with applicable data protection laws including Cameroon's data protection framework.</li>
              <li>Delete volunteer data upon request or when no longer needed for the stated purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Content Standards</h2>
            <p>All content posted by your organization (opportunity descriptions, images, updates) must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be accurate, respectful, and free from hate speech or discriminatory language.</li>
              <li>Not infringe on any third-party intellectual property rights.</li>
              <li>Not contain misleading claims about your organization's impact or credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Emergency Alerts</h2>
            <p>Organizations may not create emergency alerts unless they are responding to a genuine humanitarian emergency. Misuse of the emergency alert system will result in immediate account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Fees & Platform Use</h2>
            <p>UNITEE is currently free for organizations. We reserve the right to introduce premium features in the future with advance notice. Core volunteer recruitment features will remain free.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Termination & Suspension</h2>
            <p>UNITEE may suspend or terminate your organization account if you violate these terms, receive repeated volunteer complaints, or engage in fraudulent activity. You may request account deletion by contacting <a href="mailto:support@unitee.cm" className="text-orange-500 underline">support@unitee.cm</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of Cameroon. Disputes shall be resolved through good-faith negotiation, and if unresolved, through competent courts in Douala, Cameroon.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these terms, contact <a href="mailto:legal@unitee.cm" className="text-orange-500 underline">legal@unitee.cm</a> or write to UNITEE Legal Team, Douala, Cameroon.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default TermsOrganization;
