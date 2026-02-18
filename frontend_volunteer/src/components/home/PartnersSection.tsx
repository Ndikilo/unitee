import React from 'react';

const PartnersSection: React.FC = () => {
  const partners = [
    { name: 'UNICEF Cameroon', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png' },
    { name: 'Red Cross', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/200px-Flag_of_the_Red_Cross.svg.png' },
    { name: 'World Vision', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/World_Vision_logo.svg/200px-World_Vision_logo.svg.png' },
    { name: 'UN Volunteers', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/UN_emblem_blue.svg/200px-UN_emblem_blue.svg.png' },
    { name: 'Peace Corps', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/US-PeaceCorps-Logo.svg/200px-US-PeaceCorps-Logo.svg.png' }
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            Trusted by leading organizations
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center h-12">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
