import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: January 27, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none">
          
          <div className="bg-blue-50 p-6 rounded-xl mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Privacy Matters</h2>
            <p className="text-gray-600 mb-0">
              At UNITEE, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
          <p className="text-gray-600 mb-4">
            When you create an account, we collect information such as your name, email address, phone number, 
            location, and profile information. For NGO accounts, we also collect organization details and verification documents.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
          <p className="text-gray-600 mb-4">
            We collect information about how you use our platform, including pages visited, features used, 
            volunteer opportunities applied to, and interaction patterns to improve our services.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Device Information</h3>
          <p className="text-gray-600 mb-6">
            We may collect device information such as IP address, browser type, operating system, 
            and mobile device identifiers for security and optimization purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>To provide and maintain our volunteer matching services</li>
            <li>To verify user identities and ensure platform safety</li>
            <li>To send notifications about volunteer opportunities and platform updates</li>
            <li>To improve our services through analytics and user feedback</li>
            <li>To prevent fraud and ensure platform security</li>
            <li>To comply with legal obligations and respond to legal requests</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          
          <p className="text-gray-600 mb-4">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li><strong>With NGOs:</strong> When you apply for volunteer opportunities, we share relevant profile information with the organizing NGO</li>
            <li><strong>Public Profile:</strong> Information you choose to make public in your volunteer profile</li>
            <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our users' safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          
          <p className="text-gray-600 mb-4">
            We implement industry-standard security measures to protect your personal information:
          </p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Access controls and authentication requirements</li>
            <li>Secure data centers and backup systems</li>
            <li>Employee training on data protection practices</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights and Choices</h2>
          
          <p className="text-gray-600 mb-4">You have the following rights regarding your personal information:</p>
          
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
          
          <p className="text-gray-600 mb-4">
            We use cookies and similar technologies to enhance your experience, remember your preferences, 
            and analyze platform usage. You can control cookie settings through your browser preferences.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Children's Privacy</h2>
          
          <p className="text-gray-600 mb-6">
            Our platform is not intended for children under 13. We do not knowingly collect personal information 
            from children under 13. Volunteers aged 13-17 require parental consent to use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. International Data Transfers</h2>
          
          <p className="text-gray-600 mb-6">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your data during international transfers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Data Retention</h2>
          
          <p className="text-gray-600 mb-6">
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
            When you delete your account, we will delete or anonymize your personal information within 30 days.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
          
          <p className="text-gray-600 mb-6">
            We may update this privacy policy from time to time. We will notify you of any material changes 
            by email or through our platform. Your continued use of our services after changes become effective 
            constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
          
          <p className="text-gray-600 mb-4">
            If you have questions about this privacy policy or our data practices, please contact us:
          </p>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-gray-600 mb-2"><strong>Email:</strong> privacy@unitee.org</p>
            <p className="text-gray-600 mb-2"><strong>Address:</strong> UNITEE Privacy Team, Douala, Cameroon</p>
            <p className="text-gray-600"><strong>Response Time:</strong> We aim to respond to all privacy inquiries within 72 hours</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;