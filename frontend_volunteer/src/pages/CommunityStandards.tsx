import React from 'react';
import { UsersIcon, HeartIcon, ShieldCheckIcon, StarIcon } from '@/components/icons/Icons';

const CommunityStandards: React.FC = () => {

  const standards = [
    {
      icon: HeartIcon,
      title: 'Respect and Kindness',
      description: 'Treat all community members with respect, kindness, and empathy.',
      guidelines: [
        'Use inclusive and respectful language',
        'Be patient with new volunteers and organizations',
        'Celebrate diversity and different perspectives',
        'Offer constructive feedback when appropriate'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Prioritize the safety and wellbeing of all community members.',
      guidelines: [
        'Report any safety concerns immediately',
        'Follow all safety protocols during volunteer activities',
        'Respect personal boundaries and consent',
        'Create safe spaces for all participants'
      ]
    },
    {
      icon: UsersIcon,
      title: 'Collaboration',
      description: 'Work together to create positive impact in our communities.',
      guidelines: [
        'Communicate clearly and professionally',
        'Honor your volunteer commitments',
        'Support fellow volunteers and organizations',
        'Share knowledge and resources generously'
      ]
    },
    {
      icon: StarIcon,
      title: 'Excellence',
      description: 'Strive for excellence in all volunteer activities and interactions.',
      guidelines: [
        'Come prepared and engaged to volunteer activities',
        'Continuously learn and improve your skills',
        'Provide honest feedback to help improve experiences',
        'Lead by example in your community involvement'
      ]
    }
  ];

  const violations = [
    'Harassment, discrimination, or hate speech',
    'Sharing false or misleading information',
    'Spamming or inappropriate promotional content',
    'Violating privacy or sharing personal information without consent',
    'Engaging in illegal activities or encouraging others to do so',
    'Creating fake profiles or impersonating others',
    'Disrupting volunteer activities or community events'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Standards</h1>
          <p className="text-xl text-gray-600">
            Our shared values and guidelines for creating a positive, safe, and inclusive volunteer community.
          </p>
        </div>
      </section>

      {/* Standards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Community Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.map((standard, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <standard.icon size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{standard.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{standard.description}</p>
                <ul className="space-y-2">
                  {standard.guidelines.map((guideline, guidelineIndex) => (
                    <li key={guidelineIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Behavior */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Prohibited Behavior</h2>
          <div className="bg-white rounded-xl p-8 border border-red-200">
            <p className="text-gray-600 mb-6">
              The following behaviors are not tolerated in our community and may result in account suspension or removal:
            </p>
            <ul className="space-y-3">
              {violations.map((violation, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  {violation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Reporting Violations</h2>
          <div className="bg-gray-50 rounded-xl p-8">
            <p className="text-gray-600 text-center mb-6">
              If you witness or experience behavior that violates our community standards, please report it immediately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Report</h3>
                <p className="text-gray-600 text-sm">
                  Use the report button on any profile, message, or opportunity to flag inappropriate behavior.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
                <p className="text-gray-600 text-sm">
                  Our community team will review all reports promptly and take appropriate action.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Action</h3>
                <p className="text-gray-600 text-sm">
                  We'll take appropriate action to maintain community safety and standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Questions About Our Standards?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Our community team is here to help clarify any questions about our standards and guidelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:community@unitee.org" 
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Contact Community Team
            </a>
            <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors">
              Report a Violation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityStandards;