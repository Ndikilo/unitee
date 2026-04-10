import React from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up in minutes. Tell us your skills, interests, and availability to get matched with the right opportunities.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=75&auto=format&fit=crop',
    accent: 'bg-orange-500',
  },
  {
    number: '02',
    title: 'Discover Opportunities',
    description: 'Browse verified volunteer opportunities from trusted NGOs. Filter by location, category, and time commitment.',
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=500&q=75&auto=format&fit=crop',
    accent: 'bg-blue-600',
  },
  {
    number: '03',
    title: 'Apply & Get Accepted',
    description: 'Apply with one click. NGOs review your profile and accept volunteers who match their needs.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=75&auto=format&fit=crop',
    accent: 'bg-green-600',
  },
  {
    number: '04',
    title: 'Make an Impact',
    description: 'Volunteer, log your hours, earn badges, and build your digital volunteer passport for career opportunities.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&q=75&auto=format&fit=crop',
    accent: 'bg-orange-600',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Simple process</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">How UNITEE Works</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From sign-up to making a real difference — four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="group flex flex-col">
              {/* Image */}
              <div className="relative h-44 rounded-2xl overflow-hidden mb-5 shadow-sm">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                <span className={`absolute top-3 left-3 ${step.accent} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>

              {/* Connector (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
