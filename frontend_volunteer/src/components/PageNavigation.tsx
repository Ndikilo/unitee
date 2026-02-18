import React from 'react';
import { ChevronRightIcon } from '@/components/icons/Icons';

interface PageNavigationProps {
  onBack: () => void;
  currentPage: string;
}

const PageNavigation: React.FC<PageNavigationProps> = ({ onBack, currentPage }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRightIcon size={20} className="rotate-180" />
          <span>Back to Home</span>
        </button>
        <nav className="mt-2">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={onBack} className="hover:text-gray-700">
                Home
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{currentPage}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageNavigation;