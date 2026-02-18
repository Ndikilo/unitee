import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { opportunityAPI } from '@/lib/api';

interface CategoriesSectionProps {
  onCategoryClick: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onCategoryClick }) => {
  const { t } = useLanguage();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        // Fetch opportunities and count by category
        const opportunities = await opportunityAPI.getAll();
        const counts: Record<string, number> = {};
        
        if (opportunities && opportunities.length > 0) {
          opportunities.forEach((opp: any) => {
            counts[opp.category] = (counts[opp.category] || 0) + 1;
          });
        }
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
        setCategoryCounts({});
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const categories = [
    {
      id: 'Environment',
      name: t('cat.environment'),
      description: 'Conservation, cleanup, and sustainability',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      count: categoryCounts['Environment'] || 0
    },
    {
      id: 'Education',
      name: t('cat.education'),
      description: 'Teaching, tutoring, and mentorship',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      count: categoryCounts['Education'] || 0
    },
    {
      id: 'Healthcare',
      name: t('cat.healthcare'),
      description: 'Medical support and health awareness',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      count: categoryCounts['Healthcare'] || 0
    },
    {
      id: 'Humanitarian',
      name: t('cat.humanitarian'),
      description: 'Disaster relief and aid distribution',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      count: categoryCounts['Humanitarian'] || 0
    },
    {
      id: 'Social Services',
      name: t('cat.social'),
      description: 'Community support and social work',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      count: categoryCounts['Social Services'] || 0
    },
    {
      id: 'Economic Development',
      name: t('cat.economic'),
      description: 'Skills training and entrepreneurship',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      count: categoryCounts['Economic Development'] || 0
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Find Your Cause
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore volunteer opportunities across different categories and find the perfect way to make an impact
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 ${category.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`bg-gradient-to-br ${category.color} bg-clip-text text-transparent`}>
                    {category.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-500 mb-4">
                  {category.description}
                </p>

                {/* Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {category.count} {category.count === 1 ? 'opportunity' : 'opportunities'}
                  </span>
                  <span className="text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
