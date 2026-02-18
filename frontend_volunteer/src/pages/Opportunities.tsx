import React from 'react';
import OpportunityGrid from '@/components/opportunities/OpportunityGrid';

const Opportunities: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Volunteer Opportunities</h1>
        <p className="text-gray-600">
          Find meaningful ways to make a difference in your community
        </p>
      </div>
      
      <OpportunityGrid />
    </div>
  );
};

export default Opportunities;