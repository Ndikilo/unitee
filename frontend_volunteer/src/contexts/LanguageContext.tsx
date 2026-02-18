import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', fr: 'Accueil' },
  'nav.opportunities': { en: 'Opportunities', fr: 'Opportunités' },
  'nav.communities': { en: 'Communities', fr: 'Communautés' },
  'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'nav.admin': { en: 'Admin', fr: 'Administration' },
  'nav.impact': { en: 'My Impact', fr: 'Mon Impact' },
  'nav.signIn': { en: 'Sign In', fr: 'Connexion' },
  'nav.signUp': { en: 'Sign Up', fr: 'Inscription' },
  'nav.signOut': { en: 'Sign Out', fr: 'Déconnexion' },
  
  // Hero
  'hero.title': { en: 'Connect. Serve. Transform.', fr: 'Connecter. Servir. Transformer.' },
  'hero.subtitle': { en: 'Join thousands of volunteers making a difference in Cameroon and beyond', fr: 'Rejoignez des milliers de bénévoles qui font la différence au Cameroun et au-delà' },
  'hero.cta': { en: 'Start Volunteering', fr: 'Commencer le Bénévolat' },
  'hero.ctaOrg': { en: 'Register Your NGO', fr: 'Enregistrer Votre ONG' },
  
  // Stats
  'stats.volunteers': { en: 'Active Volunteers', fr: 'Bénévoles Actifs' },
  'stats.hours': { en: 'Hours Contributed', fr: 'Heures Contribuées' },
  'stats.organizations': { en: 'Partner Organizations', fr: 'Organisations Partenaires' },
  'stats.communities': { en: 'Communities', fr: 'Communautés' },
  
  // Opportunities
  'opp.browse': { en: 'Browse Opportunities', fr: 'Parcourir les Opportunités' },
  'opp.search': { en: 'Search opportunities...', fr: 'Rechercher des opportunités...' },
  'opp.filter': { en: 'Filter', fr: 'Filtrer' },
  'opp.category': { en: 'Category', fr: 'Catégorie' },
  'opp.location': { en: 'Location', fr: 'Lieu' },
  'opp.date': { en: 'Date', fr: 'Date' },
  'opp.apply': { en: 'Apply Now', fr: 'Postuler' },
  'opp.applied': { en: 'Applied', fr: 'Postulé' },
  'opp.volunteers': { en: 'volunteers needed', fr: 'bénévoles recherchés' },
  'opp.hours': { en: 'hours', fr: 'heures' },
  'opp.verified': { en: 'Verified', fr: 'Vérifié' },
  'opp.urgent': { en: 'Urgent', fr: 'Urgent' },
  'opp.emergency': { en: 'Emergency', fr: 'Urgence' },
  'opp.create': { en: 'Create Opportunity', fr: 'Créer une Opportunité' },
  'opp.aiAssist': { en: 'AI Assist', fr: 'Assistance IA' },
  
  // Categories
  'cat.all': { en: 'All Categories', fr: 'Toutes les Catégories' },
  'cat.environment': { en: 'Environment', fr: 'Environnement' },
  'cat.education': { en: 'Education', fr: 'Éducation' },
  'cat.healthcare': { en: 'Healthcare', fr: 'Santé' },
  'cat.humanitarian': { en: 'Humanitarian', fr: 'Humanitaire' },
  'cat.social': { en: 'Social Services', fr: 'Services Sociaux' },
  'cat.economic': { en: 'Economic Development', fr: 'Développement Économique' },
  
  // Communities
  'comm.join': { en: 'Join Community', fr: 'Rejoindre' },
  'comm.joined': { en: 'Joined', fr: 'Membre' },
  'comm.members': { en: 'members', fr: 'membres' },
  'comm.create': { en: 'Create Community', fr: 'Créer une Communauté' },
  'comm.chat': { en: 'Group Chat', fr: 'Discussion de Groupe' },
  'comm.events': { en: 'Events', fr: 'Événements' },
  'comm.polls': { en: 'Polls', fr: 'Sondages' },
  
  // Impact
  'impact.title': { en: 'Your Impact', fr: 'Votre Impact' },
  'impact.hours': { en: 'Total Hours', fr: 'Heures Totales' },
  'impact.events': { en: 'Events Completed', fr: 'Événements Complétés' },
  'impact.helped': { en: 'People Helped', fr: 'Personnes Aidées' },
  'impact.badges': { en: 'Badges Earned', fr: 'Badges Gagnés' },
  'impact.passport': { en: 'Volunteer Passport', fr: 'Passeport Bénévole' },
  'impact.certificate': { en: 'Download Certificate', fr: 'Télécharger le Certificat' },
  
  // Auth
  'auth.email': { en: 'Email', fr: 'Email' },
  'auth.password': { en: 'Password', fr: 'Mot de passe' },
  'auth.name': { en: 'Full Name', fr: 'Nom Complet' },
  'auth.phone': { en: 'Phone Number', fr: 'Numéro de Téléphone' },
  'auth.role': { en: 'I am a...', fr: 'Je suis...' },
  'auth.volunteer': { en: 'Volunteer', fr: 'Bénévole' },
  'auth.organizer': { en: 'NGO/Organizer', fr: 'ONG/Organisateur' },
  'auth.forgotPassword': { en: 'Forgot Password?', fr: 'Mot de passe oublié?' },
  'auth.noAccount': { en: "Don't have an account?", fr: "Vous n'avez pas de compte?" },
  'auth.hasAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte?' },
  
  // Admin
  'admin.verification': { en: 'Verification Queue', fr: 'File de Vérification' },
  'admin.reports': { en: 'Reports', fr: 'Signalements' },
  'admin.users': { en: 'Users', fr: 'Utilisateurs' },
  'admin.analytics': { en: 'Analytics', fr: 'Analytiques' },
  'admin.emergency': { en: 'Emergency Broadcast', fr: 'Diffusion d\'Urgence' },
  'admin.approve': { en: 'Approve', fr: 'Approuver' },
  'admin.reject': { en: 'Reject', fr: 'Rejeter' },
  'admin.ban': { en: 'Ban User', fr: 'Bannir l\'Utilisateur' },
  
  // Emergency
  'emergency.active': { en: 'EMERGENCY ALERT', fr: 'ALERTE D\'URGENCE' },
  'emergency.respond': { en: 'Respond Now', fr: 'Répondre Maintenant' },
  
  // Common
  'common.loading': { en: 'Loading...', fr: 'Chargement...' },
  'common.save': { en: 'Save', fr: 'Enregistrer' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler' },
  'common.submit': { en: 'Submit', fr: 'Soumettre' },
  'common.delete': { en: 'Delete', fr: 'Supprimer' },
  'common.edit': { en: 'Edit', fr: 'Modifier' },
  'common.view': { en: 'View', fr: 'Voir' },
  'common.close': { en: 'Close', fr: 'Fermer' },
  'common.success': { en: 'Success!', fr: 'Succès!' },
  'common.error': { en: 'Error', fr: 'Erreur' },
  'common.viewAll': { en: 'View All', fr: 'Voir Tout' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
