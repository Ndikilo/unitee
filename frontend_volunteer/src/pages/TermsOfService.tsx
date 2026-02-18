import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsOfService: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: January 27, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
          
          <div className="bg-blue-50 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to UNITEE</h2>
            <p className="text-gray-600 mb-0">
              By using our platform, you agree to these terms of service. Please read them carefully 
              as they govern your use of UNITEE and outline your rights and responsibilities.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          
          <p className="text-gray-600 mb-6">
            By accessing or using UNITEE, you agree to be bound by these Terms of Service and our Privacy Policy. 
            If you do not agree to these terms, please do not use our platform. These terms apply to all users, 
            including volunteers, NGOs, and visitors.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          
          <p className="text-gray-600 mb-4">
            UNITEE is a platform that connects volunteers with verified non-governmental organizations (NGOs) 
            and community groups offering volunteer opportunities. Our services include:
          </p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Volunteer opportunity discovery and application</li>
            <li>NGO verification and profile management</li>
            <li>Community building and networking features</li>
            <li>Volunteer tracking and certification</li>
            <li>Communication tools between volunteers and organizations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts and Registration</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
          <p className="text-gray-600 mb-4">
            To use certain features of UNITEE, you must create an account. You agree to provide accurate, 
            current, and complete information during registration and to update such information as necessary.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Security</h3>
          <p className="text-gray-600 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account. You must notify us immediately of any unauthorized use.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-6">Age Requirements</h3>
          <p className="text-gray-600 mb-6">
            You must be at least 13 years old to use UNITEE. Users under 18 require parental consent 
            and may have limited access to certain features or opportunities.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User Conduct and Responsibilities</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h3>
          <p className="text-gray-600 mb-4">You agree to use UNITEE only for lawful purposes and in accordance with these terms. You will not:</p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Provide false or misleading information</li>
            <li>Impersonate another person or organization</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post inappropriate, offensive, or illegal content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the platform for commercial purposes without permission</li>
            <li>Spam or send unsolicited communications</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Volunteer Commitments</h3>
          <p className="text-gray-600 mb-6">
            When you commit to a volunteer opportunity, you agree to fulfill that commitment to the best of your ability. 
            If you must cancel, please do so as early as possible and provide a valid reason.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. NGO and Organization Responsibilities</h2>
          
          <p className="text-gray-600 mb-4">Organizations using UNITEE agree to:</p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Provide accurate information about their organization and opportunities</li>
            <li>Maintain proper registration and legal compliance</li>
            <li>Treat volunteers with respect and provide safe environments</li>
            <li>Honor commitments made to volunteers</li>
            <li>Report any incidents or safety concerns promptly</li>
            <li>Comply with local laws and regulations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Content and Intellectual Property</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">User Content</h3>
          <p className="text-gray-600 mb-4">
            You retain ownership of content you post on UNITEE but grant us a license to use, display, 
            and distribute such content in connection with our services. You represent that you have 
            the right to post such content.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Content</h3>
          <p className="text-gray-600 mb-6">
            UNITEE and its content are protected by intellectual property laws. You may not copy, 
            modify, or distribute our content without permission.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Privacy and Data Protection</h2>
          
          <p className="text-gray-600 mb-6">
            Your privacy is important to us. Our collection and use of personal information is governed 
            by our Privacy Policy, which is incorporated into these terms by reference.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Safety and Liability</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Safety</h3>
          <p className="text-gray-600 mb-4">
            While we strive to maintain a safe platform, we cannot guarantee the actions of users. 
            You participate in volunteer activities at your own risk and should exercise appropriate caution.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
          <p className="text-gray-600 mb-6">
            UNITEE is provided "as is" without warranties. We are not liable for damages arising from 
            your use of the platform or participation in volunteer activities. Our liability is limited 
            to the maximum extent permitted by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Termination</h2>
          
          <p className="text-gray-600 mb-4">
            You may terminate your account at any time. We may suspend or terminate your account if you violate these terms. 
            Upon termination:
          </p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Your access to UNITEE will be revoked</li>
            <li>Your personal data will be deleted according to our Privacy Policy</li>
            <li>Outstanding volunteer commitments should be honored or properly canceled</li>
            <li>Certain provisions of these terms will survive termination</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Dispute Resolution</h2>
          
          <p className="text-gray-600 mb-6">
            Any disputes arising from these terms or your use of UNITEE will be resolved through binding arbitration 
            in accordance with the laws of Cameroon. You waive the right to participate in class action lawsuits.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
          
          <p className="text-gray-600 mb-6">
            We may modify these terms at any time. We will notify users of material changes via email or platform notification. 
            Continued use of UNITEE after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          
          <p className="text-gray-600 mb-6">
            These terms are governed by the laws of Cameroon. Any legal proceedings must be brought in the courts of Cameroon.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
          
          <p className="text-gray-600 mb-4">
            If you have questions about these terms, please contact us:
          </p>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-600 mb-2"><strong>Email:</strong> legal@unitee.org</p>
            <p className="text-gray-600 mb-2"><strong>Address:</strong> UNITEE Legal Team, Douala, Cameroon</p>
            <p className="text-gray-600"><strong>Response Time:</strong> We aim to respond to all legal inquiries within 5 business days</p>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h3>
            <p className="text-gray-600 mb-0">
              By using UNITEE, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please discontinue use of our platform immediately.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TermsOfService;