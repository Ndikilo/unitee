import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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
  'nav.getStarted': { en: 'Get Started', fr: 'Commencer' },
  'nav.myProfile': { en: 'My Profile', fr: 'Mon Profil' },
  'nav.myOpportunities': { en: 'My Opportunities', fr: 'Mes Opportunités' },
  'nav.settings': { en: 'Settings', fr: 'Paramètres' },
  'nav.adminPanel': { en: 'Admin Panel', fr: 'Panneau Admin' },

  // Hero
  'hero.badge': { en: 'Empowering communities through volunteering', fr: 'Autonomiser les communautés par le bénévolat' },
  'hero.word1': { en: 'Volunteer.', fr: 'Bénévole.' },
  'hero.word2': { en: 'Connect.', fr: 'Connecter.' },
  'hero.word3': { en: 'Transform.', fr: 'Transformer.' },
  'hero.subtitle': { en: 'Join a growing movement of changemakers. Find verified volunteer opportunities, build your impact portfolio, and earn recognition for your service.', fr: 'Rejoignez un mouvement croissant de porteurs de changement. Trouvez des opportunités de bénévolat vérifiées, construisez votre portfolio d\'impact et gagnez de la reconnaissance pour votre service.' },
  'hero.cta': { en: 'Start Volunteering', fr: 'Commencer le Bénévolat' },
  'hero.ctaOrg': { en: 'Post Opportunities', fr: 'Publier des Opportunités' },
  'hero.browse': { en: 'Browse Opportunities', fr: 'Voir les Opportunités' },
  'hero.volunteer': { en: 'Volunteer', fr: 'Bénévole' },

  // Stats
  'stats.volunteers': { en: 'Active Volunteers', fr: 'Bénévoles Actifs' },
  'stats.hours': { en: 'Hours Contributed', fr: 'Heures Contribuées' },
  'stats.hoursGiven': { en: 'Hours Given', fr: 'Heures Données' },
  'stats.organizations': { en: 'Partner Organizations', fr: 'Organisations Partenaires' },
  'stats.orgs': { en: 'Organizations', fr: 'Organisations' },
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
  'auth.administrator': { en: 'Administrator', fr: 'Administrateur' },
  'auth.organizer2': { en: 'Organizer', fr: 'Organisateur' },

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

const STORAGE_KEY = 'unitee-language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      return stored === 'fr' ? 'fr' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    setLanguageState(lang);
  }, []);

  // Sync document lang attribute for accessibility
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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
