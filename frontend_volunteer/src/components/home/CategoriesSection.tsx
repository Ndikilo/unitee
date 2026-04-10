import React, { useState, useEffect } from 'react';
import { opportunityAPI } from '@/lib/api';

const CATEGORY_IMAGES: Record<string, string> = {
  'Environment': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=75&auto=format&fit=crop',
  'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=75&auto=format&fit=crop',
  'Healthcare': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=75&auto=format&fit=crop',
  'Humanitarian': 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=75&auto=format&fit=crop',
  'Social Services': 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=75&auto=format&fit=crop',
  'Economic Development': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=75&auto=format&fit=crop',
};

const CATEGORIES = [
  { id: 'Environment', name: 'Environment', description: 'Conservation, cleanup & sustainability', color: 'from-emerald-600 to-teal-700' },
  { id: 'Education', name: 'Education', description: 'Teaching, tutoring & mentorship', color: 'from-blue-600 to-indigo-700' },
  { id: 'Healthcare', name: 'Healthcare', description: 'Medical support & health awareness', color: 'from-red-600 to-rose-700' },
  { id: 'Humanitarian', name: 'Humanitarian', description: 'Disaster relief & aid distribution', color: 'from-orange-600 to-amber-700' },
  { id: 'Social Services', name: 'Social Services', description: 'Community support & social work', color: 'from-purple-600 to-violet-700' },
  { id: 'Economic Development', name: 'Economic Dev.', description: 'Skills training & entrepreneurship', color: 'from-yellow-600 to-orange-600' },
];

interface CategoriesSectionProps {
  onCategoryClick: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onCategoryClick }) => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    opportunityAPI.getAll()
      .then((opps: any) => {
        const counts: Record<string, number> = {};
        (opps || []).forEach((o: any) => {
          counts[o.category] = (counts[o.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-orange-600 uppercase tracking-widest">Explore by cause</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">Find Your Cause</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Every skill matters. Pick a category and start making a difference today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className="group relative h-52 rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <img
                src={CATEGORY_IMAGES[cat.id]}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-white/80 text-sm mb-3">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                    {categoryCounts[cat.id] || 0} opportunities
                  </span>
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
