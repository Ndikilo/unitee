import React, { useState, useEffect } from 'react';
import { opportunityAPI } from '@/lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_IMAGES: Record<string, string> = {
  'Environment':          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=75&auto=format&fit=crop',
  'Education':            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=75&auto=format&fit=crop',
  'Healthcare':           'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=75&auto=format&fit=crop',
  'Humanitarian':         'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=75&auto=format&fit=crop',
  'Social Services':      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=75&auto=format&fit=crop',
  'Economic Development': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=75&auto=format&fit=crop',
  'Arts & Culture':       'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=75&auto=format&fit=crop',
  'Sports & Recreation':  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=75&auto=format&fit=crop',
  'Youth Development':    'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&q=75&auto=format&fit=crop',
  'Animal Welfare':       'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=75&auto=format&fit=crop',
  'Technology':           'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop',
  'Food & Nutrition':     'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=75&auto=format&fit=crop',
};

const CATEGORIES = [
  { id: 'Environment',          name: 'Environment',       description: 'Conservation, cleanup & sustainability',  color: 'from-emerald-600 to-teal-700' },
  { id: 'Education',            name: 'Education',         description: 'Teaching, tutoring & mentorship',         color: 'from-blue-600 to-indigo-700' },
  { id: 'Healthcare',           name: 'Healthcare',        description: 'Medical support & health awareness',      color: 'from-red-600 to-rose-700' },
  { id: 'Humanitarian',         name: 'Humanitarian',      description: 'Disaster relief & aid distribution',      color: 'from-orange-600 to-amber-700' },
  { id: 'Social Services',      name: 'Social Services',   description: 'Community support & social work',         color: 'from-purple-600 to-violet-700' },
  { id: 'Economic Development', name: 'Economic Dev.',     description: 'Skills training & entrepreneurship',      color: 'from-yellow-600 to-orange-600' },
  { id: 'Arts & Culture',       name: 'Arts & Culture',    description: 'Creative expression & heritage',          color: 'from-pink-600 to-rose-600' },
  { id: 'Sports & Recreation',  name: 'Sports & Rec.',     description: 'Fitness, coaching & outdoor activities',  color: 'from-cyan-600 to-blue-600' },
  { id: 'Youth Development',    name: 'Youth Dev.',        description: 'Empowering the next generation',          color: 'from-lime-600 to-green-700' },
  { id: 'Animal Welfare',       name: 'Animal Welfare',    description: 'Rescue, care & wildlife protection',      color: 'from-amber-600 to-yellow-700' },
  { id: 'Technology',           name: 'Technology',        description: 'Digital skills & tech for good',          color: 'from-slate-600 to-gray-700' },
  { id: 'Food & Nutrition',     name: 'Food & Nutrition',  description: 'Food security & nutrition programs',      color: 'from-green-600 to-emerald-700' },
];

const INITIAL_VISIBLE = 6;

interface CategoriesSectionProps {
  onCategoryClick: (category: string) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onCategoryClick }) => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    opportunityAPI.getAll({ status: 'published', limit: 100 })
      .then((res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res?.opportunities ?? []);
        const counts: Record<string, number> = {};
        list.forEach((o: any) => {
          if (o.category) counts[o.category] = (counts[o.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      })
      .catch(() => {});
  }, []);

  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, INITIAL_VISIBLE);
  const hiddenCount = CATEGORIES.length - INITIAL_VISIBLE;

  const handleClick = (id: string) => {
    setSelected(id);
    onCategoryClick(id);
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-sm font-semibold text-orange-600 uppercase tracking-widest">Explore by cause</span>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">Find Your Cause</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Every skill matters. Pick a category and start making a difference today.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCategories.map((cat) => {
            const isSelected = selected === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                className={`group relative h-52 rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  isSelected ? 'ring-2 ring-orange-400 shadow-xl scale-[1.02]' : ''
                }`}
              >
                <img
                  src={CATEGORY_IMAGES[cat.id]}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} ${isSelected ? 'opacity-85' : 'opacity-70 group-hover:opacity-80'} transition-opacity`} />

                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-white/90 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    Selected ✓
                  </div>
                )}

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                  <p className="text-white/80 text-sm mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs bg-white/15 px-2.5 py-1 rounded-full">
                      {categoryCounts[cat.id]
                        ? `${categoryCounts[cat.id]} opportunit${categoryCounts[cat.id] === 1 ? 'y' : 'ies'}`
                        : 'Explore'}
                    </span>
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    </span>
                      Browse →
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* View More / View Less */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            {showAll ? (
              <>
                <ChevronUp size={18} className="text-orange-500" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={18} className="text-orange-500" />
                View {hiddenCount} More Categories
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Showing {visibleCategories.length} of {CATEGORIES.length} categories
          </p>
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;
