import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermsVolunteer: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-3xl mx-auto">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8">
        <ArrowLeft size={16} /> Back to Registration
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-10">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="UNITEE" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold"><span className="text-orange-500">UNI</span><span className="text-blue-600">TEE</span></span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-1">Volunteer Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026 · Applies to: Individual Volunteers</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By creating a volunteer account on UNITEE ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not register or use the Platform. These terms apply exclusively to individual volunteers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to register. Users under 18 require parental or guardian consent.</li>
              <li>You must provide accurate, truthful information during registration.</li>
              <li>One account per person. Creating multiple accounts is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Volunteer Responsibilities</h2>
            <p>As a volunteer on UNITEE, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attend or cancel registered opportunities in a timely manner (at least 24 hours notice for cancellations).</li>
              <li>Behave respectfully and professionally toward organizers, other volunteers, and beneficiaries.</li>
              <li>Not misrepresent your skills, qualifications, or availability.</li>
              <li>Comply with the rules and guidelines set by each organizing NGO or community group.</li>
              <li>Not use volunteer opportunities for personal commercial gain.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Account & Profile</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately at <a href="mailto:support@unitee.cm" className="text-orange-500 underline">support@unitee.cm</a> if you suspect unauthorized access to your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Certificates & Badges</h2>
            <p>Digital certificates and badges issued through UNITEE are based on verified participation data. Falsifying participation records to obtain certificates is a serious violation and will result in immediate account suspension and revocation of all certificates.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Prohibited Conduct</h2>
            <p>You must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, threaten, or discriminate against any user or beneficiary.</li>
              <li>Post false, misleading, or harmful content on the Platform.</li>
              <li>Attempt to access other users' accounts or data.</li>
              <li>Use the Platform for any illegal activity.</li>
              <li>Spam or send unsolicited messages to other users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Safety & Liability</h2>
            <p>UNITEE connects volunteers with organizations but is not responsible for events that occur during volunteer activities. You participate in all activities at your own risk. We strongly encourage you to read each opportunity's safety guidelines before signing up.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Termination</h2>
            <p>UNITEE reserves the right to suspend or permanently delete your account if you violate these terms. You may also delete your account at any time from your profile settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to Terms</h2>
            <p>We may update these terms periodically. We will notify you via email or platform notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:legal@unitee.cm" className="text-orange-500 underline">legal@unitee.cm</a> or write to UNITEE Legal Team, Douala, Cameroon.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default TermsVolunteer;
