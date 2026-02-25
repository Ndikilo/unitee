import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBanner from '@/components/home/EmergencyBanner';
import HeroSection from '@/components/home/HeroSection';
import FeaturedOpportunities from '@/components/home/FeaturedOpportunities';
import CategoriesSection from '@/components/home/CategoriesSection';
import HowItWorks from '@/components/home/HowItWorks';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';
import PartnersSection from '@/components/home/PartnersSection';
import ImpactStats from '@/components/home/ImpactStats';
import OpportunityGrid from '@/components/opportunities/OpportunityGrid';
import CommunitiesGrid from '@/components/communities/CommunitiesGrid';
import VolunteerDashboard from '@/components/dashboard/VolunteerDashboard';
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AuthModal from '@/components/auth/AuthModal';

// Pages
import About from '@/pages/About';
import HelpCenter from '@/pages/HelpCenter';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import SafetyGuidelines from '@/pages/SafetyGuidelines';
import CommunityStandards from '@/pages/CommunityStandards';
import CertificateVerify from '@/pages/CertificateVerify';


const AppLayout: React.FC = () => {
  // Try to get language context, but provide fallback if not available
  let t = (key: string) => key; // Default fallback function
  try {
    const { t: translateFn } = useLanguage();
    t = translateFn;
  } catch (error) {
    console.log('Language context not available in AppLayout, using fallback');
  }
  
  // Get initial view from URL parameters
  const getInitialView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    return viewParam || 'home';
  };
  
  const [currentView, setCurrentView] = useState(getInitialView());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Try to get auth context, but don't fail if it's not available
  let user = null;
  let isAuthenticated = false;
  
  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    // Auth context not available, use defaults
    console.log('Auth context not available in AppLayout');
  }

  // Update URL when view changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentView === 'home') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', currentView);
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentView]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      handleNavigation('opportunities');
    } else {
      window.location.href = '/register';
    }
  };

  const handleRegisterNGO = () => {
    window.location.href = '/register';
  };

  const handleCategoryClick = (category: string) => {
    handleNavigation('opportunities');
  };

  const handleEmergencyRespond = () => {
    handleNavigation('opportunities');
  };

  const handleNavigation = (view: string) => {
    // Add a brief transition effect for visual feedback
    setIsTransitioning(true);
    setCurrentView(view);
    
    // Update URL
    const url = new URL(window.location.href);
    if (view === 'home') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', view);
    }
    window.history.replaceState({}, '', url.toString());
    
    // Scroll to top immediately when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsTransitioning(false);
    }, 100);
  };

  // Additional safeguard: scroll to top whenever currentView changes
  useEffect(() => {
    // Small delay to ensure content has rendered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case 'opportunities':
        return (
          <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('opp.browse')}</h1>
                <p className="text-gray-600">Find volunteer opportunities that match your skills and interests</p>
              </div>
              <OpportunityGrid />
            </div>
          </div>
        );

      case 'communities':
        return (
          <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <CommunitiesGrid />
            </div>
          </div>
        );

      case 'impact':
        return (
          <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <VolunteerDashboard />
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {user?.role === 'organizer' ? (
                <OrganizerDashboard />
              ) : user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <VolunteerDashboard />
              )}
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AdminDashboard />
            </div>
          </div>
        );

      // Footer Pages
      case 'about':
        return (
          <div className="pt-16">
            <About />
          </div>
        );

      case 'help-center':
        return (
          <div className="pt-16">
            <HelpCenter />
          </div>
        );

      case 'privacy-policy':
        return (
          <div className="pt-16">
            <PrivacyPolicy />
          </div>
        );

      case 'terms-of-service':
        return (
          <div className="pt-16">
            <TermsOfService />
          </div>
        );

      case 'safety-guidelines':
        return (
          <div className="pt-16">
            <SafetyGuidelines />
          </div>
        );

      case 'community-standards':
        return (
          <div className="pt-16">
            <CommunityStandards />
          </div>
        );

      case 'verify-certificate':
        return (
          <div className="pt-16">
            <CertificateVerify />
          </div>
        );

      case 'home':
      default:
        return (
          <>
            {/* Emergency Banner */}
            <div className="pt-16">
              <EmergencyBanner onRespond={handleEmergencyRespond} />
            </div>

            {/* Hero Section */}
            <HeroSection 
              onGetStarted={handleGetStarted}
              onRegisterNGO={handleRegisterNGO}
            />

            {/* Featured Opportunities */}
            <FeaturedOpportunities 
              onViewAll={() => handleNavigation('opportunities')}
            />

            {/* Impact Stats */}
            <ImpactStats />

            {/* Categories */}
            <CategoriesSection onCategoryClick={handleCategoryClick} />

            {/* How It Works */}
            <HowItWorks />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Partners */}
            <PartnersSection />

            {/* CTA Section */}
            <CTASection 
              onGetStarted={handleGetStarted}
              onRegisterNGO={handleRegisterNGO}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header 
        currentView={currentView}
        onNavigate={handleNavigation}
      />

      {/* Main Content */}
      <main className={`transition-opacity duration-100 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigation} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default AppLayout;
