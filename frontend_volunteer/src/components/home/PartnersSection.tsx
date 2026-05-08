import React from 'react';

// Using text-based partner logos to avoid broken external image links
const PARTNERS = [
  { name: 'UNICEF', color: 'text-blue-600' },
  { name: 'Red Cross', color: 'text-red-600' },
  { name: 'World Vision', color: 'text-blue-800' },
  { name: 'UN Volunteers', color: 'text-sky-700' },
  { name: 'Peace Corps', color: 'text-blue-700' },
  { name: 'GIZ', color: 'text-green-700' },
];

const PartnersSection: React.FC = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-10">
          Trusted by leading organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PARTNERS.map((p) => (
            <span
              key={p.name}
              className={`text-lg font-bold ${p.color} opacity-40 hover:opacity-80 transition-opacity cursor-default select-none`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
