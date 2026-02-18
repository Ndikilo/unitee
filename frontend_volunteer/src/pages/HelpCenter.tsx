import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchIcon, ChevronDownIcon, MessageCircleIcon, HeartIcon } from '@/components/icons/Icons';

const HelpCenter: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        'How to create your volunteer profile',
        'Finding your first volunteer opportunity',
        'Understanding the application process',
        'Setting up notifications'
      ]
    },
    {
      title: 'For Volunteers',
      icon: '👥',
      articles: [
        'How to apply for opportunities',
        'Managing your volunteer schedule',
        'Earning and displaying badges',
        'Building your volunteer portfolio'
      ]
    },
    {
      title: 'For NGOs',
      icon: '🏢',
      articles: [
        'Creating your organization profile',
        'Posting volunteer opportunities',
        'Managing volunteer applications',
        'Getting verified status'
      ]
    },
    {
      title: 'Safety & Guidelines',
      icon: '🛡️',
      articles: [
        'Community safety guidelines',
        'Reporting inappropriate behavior',
        'Emergency procedures',
        'Data privacy and security'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I sign up as a volunteer?',
      answer: 'Creating a volunteer account is simple! Click the "Sign Up" button, choose "Volunteer" as your role, fill in your basic information, and verify your email. You can then complete your profile and start browsing opportunities.'
    },
    {
      question: 'Is UNITEE free to use?',
      answer: 'Yes! UNITEE is completely free for volunteers. NGOs can also post opportunities for free, though we may introduce premium features for organizations in the future.'
    },
    {
      question: 'How do I know if an NGO is legitimate?',
      answer: 'We verify all NGOs on our platform. Look for the blue verification badge next to organization names. We check registration documents, contact information, and conduct background reviews before approving organizations.'
    },
    {
      question: 'Can I volunteer if I\'m under 18?',
      answer: 'Yes, but volunteers under 18 need parental consent and can only participate in age-appropriate opportunities. Some organizations may have specific age requirements for their activities.'
    },
    {
      question: 'What if I need to cancel my volunteer commitment?',
      answer: 'We understand that circumstances change. You can cancel your commitment through your dashboard, but please do so as early as possible and provide a reason. Frequent cancellations may affect your volunteer rating.'
    },
    {
      question: 'How do I report a problem or inappropriate behavior?',
      answer: 'You can report issues directly through the platform using the "Report" button on any profile or opportunity. For urgent safety concerns, contact our support team immediately at support@unitee.org.'
    },
    {
      question: 'Can I volunteer remotely?',
      answer: 'Yes! Many organizations offer remote volunteer opportunities like online tutoring, digital marketing, content creation, and virtual event support. Filter by "Remote" when browsing opportunities.'
    },
    {
      question: 'How do volunteer badges and certificates work?',
      answer: 'You earn badges by completing volunteer hours, participating in different types of activities, and achieving milestones. Organizations can also issue certificates for completed programs, which appear in your volunteer portfolio.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, FAQs, or topics..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-gray-600 hover:text-blue-600 cursor-pointer text-sm">
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDownIcon 
                    size={20} 
                    className={`text-gray-400 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our support team is here to help you with any questions or issues you might have.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <MessageCircleIcon size={32} className="text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 text-sm mb-4">Get instant help from our support team</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">Start Chat</button>
            </div>
            <div className="bg-emerald-50 p-6 rounded-xl">
              <svg className="w-8 h-8 text-emerald-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
              <a href="mailto:support@unitee.org" className="text-emerald-600 font-medium hover:text-emerald-700">
                support@unitee.org
              </a>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <HeartIcon size={32} className="text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
              <p className="text-gray-600 text-sm mb-4">Connect with other volunteers</p>
              <button className="text-purple-600 font-medium hover:text-purple-700">Join Forum</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;