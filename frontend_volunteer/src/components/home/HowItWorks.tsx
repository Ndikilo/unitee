import React from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up in minutes. Share your skills, languages, and availability. Whether you speak French, English or a local language — there\'s a place for you.',
    // Young African person on phone/laptop registering
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop',
    accent: 'bg-orange-500',
    tag: 'Free & Easy',
  },
  {
    number: '02',
    title: 'Discover Opportunities',
    description: 'Browse verified opportunities from NGOs, CBOs and community groups across Cameroon. Filter by city, region, or cause that matters to you.',
    // African community gathering / group activity
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80&auto=format&fit=crop',
    accent: 'bg-blue-600',
    tag: 'Across Cameroon',
  },
  {
    number: '03',
    title: 'Apply & Get Accepted',
    description: 'Apply with one tap. Local NGOs review your profile and confirm your spot. You\'ll get notified instantly — no paperwork, no delays.',
    // African people in a meeting / handshake
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80&auto=format&fit=crop',
    accent: 'bg-green-600',
    tag: 'Instant Notification',
  },
  {
    number: '04',
    title: 'Serve & Earn Recognition',
    description: 'Show up, make an impact, and log your hours. Earn digital badges and certificates you can share on LinkedIn or use for job applications.',
    // African volunteers working together in community
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop',
    accent: 'bg-orange-600',
    tag: 'Build Your CV',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Simple process</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">How UNITEE Works</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From sign-up to making a real difference in your community — four simple steps built for Cameroon.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="group flex flex-col">

              {/* Image card */}
              <div className="relative h-52 rounded-2xl overflow-hidden mb-5 shadow-sm">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

                {/* Step number badge */}
                <span className={`absolute top-3 left-3 ${step.accent} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                  {step.number}
                </span>

                {/* Tag bottom right */}
                <span className="absolute bottom-3 right-3 bg-white/90 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {step.tag}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{step.description}</p>

              {/* Step connector arrow (desktop only, not on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex items-center justify-end mt-4 pr-2 text-gray-300 text-xl font-light select-none">
                  {/* visual separator handled by grid gap */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8 text-center border border-orange-100">
          <p className="text-lg font-semibold text-gray-800 mb-1">
            "Volunteering is not just giving time — it's building the Cameroon we want to see."
          </p>
          <p className="text-sm text-gray-500">— UNITEE Community, Douala</p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
