import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlobeIcon, UsersIcon, HeartIcon, TrophyIcon } from '@/components/icons/Icons';

const About: React.FC = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: HeartIcon,
      title: 'Community First',
      description: 'We believe in the power of communities to create lasting change. Every volunteer opportunity is designed to strengthen local bonds and address real community needs.'
    },
    {
      icon: GlobeIcon,
      title: 'Global Impact',
      description: 'While we start in Cameroon, our vision extends globally. We\'re building a platform that can connect volunteers with meaningful opportunities anywhere in the world.'
    },
    {
      icon: UsersIcon,
      title: 'Inclusive Platform',
      description: 'UNITEE welcomes everyone regardless of background, experience, or skill level. We believe every person has something valuable to contribute to their community.'
    },
    {
      icon: TrophyIcon,
      title: 'Excellence & Impact',
      description: 'We\'re committed to creating high-quality volunteer experiences that deliver real impact for communities and meaningful growth for volunteers.'
    }
  ];

  const team = [
    {
      name: 'Leadership Team',
      description: 'Experienced professionals passionate about social impact and technology innovation.',
      count: '5+ Leaders'
    },
    {
      name: 'Development Team',
      description: 'Skilled developers and designers creating intuitive, accessible volunteer experiences.',
      count: '10+ Developers'
    },
    {
      name: 'Community Team',
      description: 'Local coordinators and community managers ensuring authentic connections.',
      count: '15+ Coordinators'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About UNITEE
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building the future of volunteering in Africa, connecting passionate individuals 
              with meaningful opportunities to create lasting positive change in their communities.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                UNITEE exists to democratize volunteering across Africa by creating a transparent, 
                accessible platform that connects volunteers with verified organizations and 
                meaningful opportunities.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that when people come together with shared purpose, they can solve 
                any challenge. Our platform removes barriers to volunteering and makes it easy 
                for anyone to contribute their skills and time to causes they care about.
              </p>
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600">
                  A world where every person has easy access to meaningful volunteer opportunities, 
                  and every community has the support it needs to thrive.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Impact So Far</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Volunteers Connected</span>
                  <span className="text-2xl font-bold">2,500+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hours Contributed</span>
                  <span className="text-2xl font-bold">15,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>NGOs Supported</span>
                  <span className="text-2xl font-bold">150+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Communities Served</span>
                  <span className="text-2xl font-bold">50+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape how we build our platform and community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <value.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a diverse team of passionate individuals united by our commitment to social impact and community empowerment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((group, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{group.count.split('+')[0]}+</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-gray-600">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Mission</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a volunteer looking to make a difference or an organization seeking support, 
            we'd love to have you as part of the UNITEE community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Start Volunteering
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              Partner With Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;