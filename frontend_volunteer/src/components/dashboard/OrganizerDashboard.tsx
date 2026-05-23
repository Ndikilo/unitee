import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { organizerAPI, opportunityAPI, communityAPI } from '@/lib/api';
import {
  PlusIcon,
  UsersIcon,
  EyeIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  SparklesIcon,
  ClockIcon,
  BarChartIcon,
  ShieldCheckIcon
} from '@/components/icons/Icons';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Try to get language context, but provide fallback if not available
  let t = (key: string) => key; // Default fallback function
  let language = 'en'; // Default language
  try {
    const { t: translateFn, language: lang } = useLanguage();
    t = translateFn;
    language = lang;
  } catch (error) {
    console.log('Language context not available, using fallback');
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'applicants' | 'create'>('overview');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Real data states
  const [stats, setStats] = useState({
    activeOpportunities: 0,
    totalApplicants: 0,
    totalViews: 0,
    completedEvents: 0,
    applicationRate: 0,
    completionRate: 0,
    averageRating: 0
  });
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  
  // Create opportunity form state
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    city: '',
    category: 'Environment',
    description: '',
    volunteers_needed: 20,
    hours_per_volunteer: 4,
    start_date: '',
    end_date: '',
    skills_required: [] as string[],
    community: '',
    contact_email: '',
    is_emergency: false,
  });
  const [skillInput, setSkillInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);

  const statsCards = [
    { label: 'Active Opportunities', value: stats.activeOpportunities || 0, icon: CalendarIcon, color: 'bg-blue-500' },
    { label: 'Total Applicants', value: stats.totalApplicants || 0, icon: UsersIcon, color: 'bg-emerald-500' },
    { label: 'Total Views', value: stats.totalViews || 0, icon: EyeIcon, color: 'bg-purple-500' },
    { label: 'Completed Events', value: stats.completedEvents || 0, icon: CheckIcon, color: 'bg-amber-500' }
  ];

  // Mock data for now
  const mockOpportunitiesData: any[] = [];
  const mockApplicantsData: any[] = [];

  // Use state data or fall back to mock
  const opportunitiesData = opportunities.length > 0 ? opportunities : mockOpportunitiesData;
  const applicantsData = applicants.length > 0 ? applicants : mockApplicantsData;

  const categories = [
    'Environment', 'Education', 'Healthcare', 'Humanitarian', 'Social Services', 'Economic Development'
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDataLoading(true);
        const [statsData, opportunitiesData, applicantsData] = await Promise.all([
          organizerAPI.getStats(),
          organizerAPI.getOpportunities({ status: 'all' }),
          organizerAPI.getApplications()
        ]);

        if (statsData) {
          setStats({
            activeOpportunities: statsData.activeOpportunities || 0,
            totalApplicants: statsData.totalApplicants || 0,
            totalViews: statsData.totalViews || 0,
            completedEvents: statsData.completedEvents || 0,
            applicationRate: statsData.applicationRate || 0,
            completionRate: statsData.completionRate || 0,
            averageRating: statsData.averageRating || 0
          });
        }

        if (opportunitiesData && opportunitiesData.length > 0) {
          setOpportunities(opportunitiesData);
        } else {
          setOpportunities([]);
        }

        if (applicantsData && applicantsData.length > 0) {
          setApplicants(applicantsData);
        } else {
          setApplicants([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        // Set empty arrays instead of mock data
        setOpportunities([]);
        setApplicants([]);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
      // Load communities for the opportunity form
      communityAPI.getAll({ limit: 50 }).then((res: any) => {
        setCommunities(res.data || res || []);
      }).catch(() => {});
    }
  }, [user]);

  const handleAIAssist = async () => {
    if (!formData.title || !formData.goal || !formData.city) {
      alert('Please fill in title, goal, and city first');
      return;
    }
    setIsGenerating(true);
    try {
      setFormData(prev => ({
        ...prev,
        description: `Join us for ${formData.title} in ${formData.city}. This ${formData.category.toLowerCase()} initiative aims to ${formData.goal}. Your participation will make a real difference in our community. We welcome volunteers of all backgrounds and experience levels.`,
        skills_required: ['Teamwork', 'Communication', 'Enthusiasm']
      }));
    } catch (err) {
      console.error('AI assist error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);
    if (!formData.title.trim()) return setCreateError('Title is required');
    if (!formData.description.trim()) return setCreateError('Description is required');
    if (!formData.start_date) return setCreateError('Start date is required');
    if (!formData.community) return setCreateError('Please select a community');
    setLoading(true);
    try {
      await opportunityAPI.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: { city: formData.city, address: formData.city },
        dateTime: {
          start: new Date(formData.start_date).toISOString(),
          end: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
          duration: formData.hours_per_volunteer,
        },
        requirements: { skills: formData.skills_required },
        capacity: { required: formData.volunteers_needed },
        community: formData.community,
        contactInfo: { email: formData.contact_email },
        isEmergency: formData.is_emergency,
        tags: [formData.category],
        impact: { description: formData.goal },
      });
      setCreateSuccess(true);
      setFormData({
        title: '', goal: '', city: '', category: 'Environment',
        description: '', volunteers_needed: 20, hours_per_volunteer: 4,
        start_date: '', end_date: '', skills_required: [], community: '',
        contact_email: '', is_emergency: false,
      });
      const [statsData, oppsData] = await Promise.all([
        organizerAPI.getStats(),
        organizerAPI.getOpportunities({ status: 'all' }),
      ]);
      if (statsData) setStats(s => ({ ...s, ...statsData }));
      if (oppsData) setOpportunities(oppsData);
      setTimeout(() => { setCreateSuccess(false); setActiveTab('opportunities'); }, 2000);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{user?.organization?.name || 'NGO Dashboard'}</h1>
            {user?.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                <ShieldCheckIcon size={12} />
                Verified
              </span>
            )}
          </div>
          <p className="text-gray-500">Manage your volunteer opportunities and applicants</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <PlusIcon size={20} />
          {t('opp.create')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'opportunities', label: 'My Opportunities' },
              { id: 'applicants', label: 'Applicants' },
              { id: 'create', label: t('opp.create') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats Chart Placeholder */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                  <BarChartIcon size={24} className="text-blue-600" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.applicationRate || 0}%</p>
                    <p className="text-sm text-gray-500">Application Rate</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{stats.completionRate || 0}%</p>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.averageRating || 0}</p>
                    <p className="text-sm text-gray-500">Avg Rating</p>
                  </div>
                </div>
              </div>

              {/* Recent Opportunities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Opportunities</h3>
                <div className="space-y-3">
                  {opportunitiesData.slice(0, 3).map((opp) => (
                    <div key={opp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{opp.title}</p>
                        <p className="text-sm text-gray-500">{opp.applicants} applicants • {opp.views} views</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(opp.status)}`}>
                        {opp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {opportunitiesData.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{opp.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(opp.status)}`}>
                        {opp.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <UsersIcon size={14} />
                        {opp.applicants} applicants
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon size={14} />
                        {opp.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        {opp.date}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="space-y-4">
              {applicantsData.map((applicant) => (
                <div key={applicant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <img
                      src={applicant.avatar}
                      alt={applicant.name}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{applicant.name}</p>
                      <p className="text-sm text-gray-500">Applied for: {applicant.event}</p>
                      <div className="flex gap-1 mt-1">
                        {applicant.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {applicant.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                        <CheckIcon size={20} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                        <XIcon size={20} />
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create New Opportunity</h3>
                <button onClick={handleAIAssist} disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50">
                  <SparklesIcon size={18} />
                  {isGenerating ? 'Generating...' : 'AI Assist'}
                </button>
              </div>

              {createSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium">
                  ✓ Opportunity created successfully! Redirecting to your opportunities...
                </div>
              )}
              {createError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateOpportunity} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.title}
                      onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="e.g., Beach Cleanup Drive" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Community <span className="text-red-500">*</span></label>
                  <select value={formData.community} onChange={e => setFormData(p => ({ ...p, community: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" required>
                    <option value="">Select a community</option>
                    {communities.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {communities.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No communities found. <a href="/communities" className="underline">Create one first</a>.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal / Objective</label>
                  <input type="text" value={formData.goal}
                    onChange={e => setFormData(p => ({ ...p, goal: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="What do you want to achieve?" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City / Location</label>
                  <input type="text" value={formData.city}
                    onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g., Douala" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    rows={4} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    placeholder="Describe the opportunity, what volunteers will do, and the impact..." />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.start_date}
                      onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                    <input type="date" value={formData.end_date}
                      onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Volunteers Needed</label>
                    <input type="number" min={1} value={formData.volunteers_needed}
                      onChange={e => setFormData(p => ({ ...p, volunteers_needed: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours/Volunteer</label>
                    <input type="number" min={1} value={formData.hours_per_volunteer}
                      onChange={e => setFormData(p => ({ ...p, hours_per_volunteer: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Required Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setFormData(p => ({ ...p, skills_required: [...p.skills_required, skillInput.trim()] })); setSkillInput(''); } } }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Type a skill and press Enter" />
                    <button type="button" onClick={() => { if (skillInput.trim()) { setFormData(p => ({ ...p, skills_required: [...p.skills_required, skillInput.trim()] })); setSkillInput(''); } }}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {skill}
                        <button type="button" onClick={() => setFormData(p => ({ ...p, skills_required: p.skills_required.filter((_, j) => j !== i) }))}
                          className="text-blue-500 hover:text-blue-700 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                    <input type="email" value={formData.contact_email}
                      onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="contact@org.com" />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id="emergency" checked={formData.is_emergency}
                      onChange={e => setFormData(p => ({ ...p, is_emergency: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300" />
                    <label htmlFor="emergency" className="text-sm font-medium text-gray-700">🚨 Mark as Emergency</label>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
