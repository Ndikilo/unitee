import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PrivacyVolunteer: React.FC = () => (
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
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-1">Volunteer Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: April 2026 · Applies to: Individual Volunteers</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>UNITEE ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect from volunteers, how we use it, and your rights regarding that data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p><strong>Account Information:</strong> Name, email address, password (hashed), date of birth, gender, phone number, and profile photo.</p>
            <p className="mt-2"><strong>Profile Information:</strong> Skills, interests, location (city/region), bio, and languages spoken.</p>
            <p className="mt-2"><strong>Activity Data:</strong> Volunteer hours logged, opportunities applied for and attended, badges earned, certificates issued, and communities joined.</p>
            <p className="mt-2"><strong>Technical Data:</strong> IP address, browser type, device information, and usage logs for security and performance purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To create and manage your volunteer account.</li>
              <li>To match you with relevant volunteer opportunities.</li>
              <li>To generate and verify digital certificates and badges.</li>
              <li>To send notifications about opportunities, applications, and platform updates.</li>
              <li>To improve the Platform's features and user experience.</li>
              <li>To ensure platform security and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Shared with Organizations</h2>
            <p>When you apply for a volunteer opportunity, the organizing NGO or community group will be able to see your:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Name, profile photo, and bio</li>
              <li>Skills and interests relevant to the opportunity</li>
              <li>Volunteer history and hours (summary only)</li>
              <li>Contact email (only after application is accepted)</li>
            </ul>
            <p className="mt-3">We do not share your phone number, date of birth, or full address with organizations without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
            <p>We use industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Encrypted passwords (bcrypt hashing)</li>
              <li>JWT-based secure authentication tokens</li>
              <li>HTTPS encryption for all data in transit</li>
              <li>Rate limiting to prevent brute-force attacks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., certificate verification records).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access</strong> — Request a copy of your personal data.</li>
              <li><strong>Correction</strong> — Update inaccurate information via your profile settings.</li>
              <li><strong>Deletion</strong> — Request deletion of your account and data.</li>
              <li><strong>Portability</strong> — Request your data in a portable format.</li>
              <li><strong>Opt-out</strong> — Unsubscribe from non-essential email notifications at any time.</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact <a href="mailto:privacy@unitee.cm" className="text-orange-500 underline">privacy@unitee.cm</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use session cookies for authentication and local storage for user preferences. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>For privacy concerns, contact our Privacy Team at <a href="mailto:privacy@unitee.cm" className="text-orange-500 underline">privacy@unitee.cm</a> — Douala, Cameroon. We respond within 72 hours.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyVolunteer;
