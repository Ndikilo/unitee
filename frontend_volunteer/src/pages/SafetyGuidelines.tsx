import React from 'react';
import { ShieldCheckIcon, AlertTriangleIcon, UsersIcon, HeartIcon } from '@/components/icons/Icons';

const SafetyGuidelines: React.FC = () => {

  const safetyTips = [
    {
      icon: ShieldCheckIcon,
      title: 'Verify Organizations',
      description: 'Always volunteer with verified NGOs. Look for the blue verification badge and read reviews from other volunteers.',
      tips: [
        'Check the organization\'s verification status',
        'Read reviews and ratings from other volunteers',
        'Research the organization\'s background and mission',
        'Contact the organization directly if you have questions'
      ]
    },
    {
      icon: UsersIcon,
      title: 'Meet Safely',
      description: 'When meeting for volunteer activities, prioritize your safety and follow these guidelines.',
      tips: [
        'Meet in public, well-lit locations',
        'Inform someone about your volunteer plans',
        'Bring a friend when possible',
        'Trust your instincts - leave if something feels wrong'
      ]
    },
    {
      icon: AlertTriangleIcon,
      title: 'Report Concerns',
      description: 'If you encounter any inappropriate behavior or safety concerns, report them immediately.',
      tips: [
        'Use the in-app reporting feature',
        'Contact our support team for urgent issues',
        'Document incidents with photos or screenshots',
        'Don\'t hesitate to contact local authorities if needed'
      ]
    },
    {
      icon: HeartIcon,
      title: 'Personal Wellbeing',
      description: 'Take care of your physical and mental health while volunteering.',
      tips: [
        'Don\'t overcommit - volunteer within your limits',
        'Take breaks and stay hydrated',
        'Seek support if you encounter traumatic situations',
        'Maintain work-life balance'
      ]
    }
  ];

  const emergencyContacts = [
    { service: 'UNITEE Emergency Support', contact: '+237 123 456 789', available: '24/7' },
    { service: 'Cameroon Police', contact: '117', available: '24/7' },
    { service: 'Medical Emergency', contact: '119', available: '24/7' },
    { service: 'Fire Department', contact: '118', available: '24/7' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon size={32} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety Guidelines</h1>
          <p className="text-xl text-gray-600">
            Your safety is our top priority. Follow these guidelines to ensure a safe and positive volunteering experience.
          </p>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Essential Safety Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {safetyTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <tip.icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{tip.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{tip.description}</p>
                <ul className="space-y-2">
                  {tip.tips.map((tipItem, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {tipItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Red Flags to Watch For</h2>
          <div className="bg-white rounded-xl p-8 border border-red-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Organization Red Flags</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Unverified organization status</li>
                  <li>• Requests for money or personal financial information</li>
                  <li>• Vague or unclear opportunity descriptions</li>
                  <li>• No clear contact information or address</li>
                  <li>• Pressure to commit immediately</li>
                  <li>• Poor reviews or no reviews from volunteers</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Situation Red Flags</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Requests to meet in isolated locations</li>
                  <li>• Inappropriate personal questions</li>
                  <li>• Unsafe working conditions</li>
                  <li>• Discrimination or harassment</li>
                  <li>• Activities that seem illegal or unethical</li>
                  <li>• Refusal to provide safety equipment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Emergency Contacts</h2>
          <div className="bg-gray-50 rounded-xl p-8">
            <p className="text-gray-600 text-center mb-6">
              Save these important numbers and don't hesitate to use them if you feel unsafe or encounter an emergency.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900">{contact.service}</h4>
                  <p className="text-2xl font-bold text-blue-600">{contact.contact}</p>
                  <p className="text-sm text-gray-500">Available {contact.available}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reporting Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How to Report Issues</h2>
          <div className="bg-white rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Document</h3>
                <p className="text-gray-600 text-sm">
                  Take screenshots, photos, or notes about the incident. Include dates, times, and people involved.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Report</h3>
                <p className="text-gray-600 text-sm">
                  Use the in-app report button or contact our support team immediately with your documentation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Follow Up</h3>
                <p className="text-gray-600 text-sm">
                  We'll investigate promptly and keep you informed. For urgent safety issues, contact local authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Questions About Safety?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is here to help with any safety concerns or questions you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:safety@unitee.org" 
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Contact Safety Team
            </a>
            <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors">
              Report an Issue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SafetyGuidelines;