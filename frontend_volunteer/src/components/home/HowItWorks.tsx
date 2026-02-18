import React from 'react';
import { SearchIcon, CheckIcon, TrophyIcon, UsersIcon } from '@/components/icons/Icons';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and tell us about your skills, interests, and availability. Get matched with opportunities that fit you.',
      icon: UsersIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '02',
      title: 'Discover Opportunities',
      description: 'Browse verified volunteer opportunities from trusted NGOs. Filter by location, category, and time commitment.',
      icon: SearchIcon,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      number: '03',
      title: 'Apply & Get Accepted',
      description: 'Apply with one click. NGOs review your profile and accept volunteers who match their needs.',
      icon: CheckIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '04',
      title: 'Make an Impact',
      description: 'Volunteer, track your hours, earn badges, and build your digital volunteer passport for career opportunities.',
      icon: TrophyIcon,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How UNITEE Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join thousands of volunteers making a difference in just four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-200" />
              )}
              
              <div className="relative bg-white rounded-2xl p-6 text-center">
                {/* Step Number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-sm font-bold text-gray-500">{step.number}</span>
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mb-6 mt-4`}>
                  <step.icon size={28} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
