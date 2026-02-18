import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminAPI } from '@/lib/api';
import {
  ShieldCheckIcon,
  UsersIcon,
  FlagIcon,
  AlertTriangleIcon,
  CheckIcon,
  XIcon,
  EyeIcon,
  BarChartIcon,
  FileTextIcon,
  SendIcon,
  TrendingUpIcon,
  ActivityIcon,
  ClockIcon,
  ServerIcon,
  ZapIcon,
  BellIcon,
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
  DownloadIcon,
  SettingsIcon,
  PieChartIcon,
  CalendarIcon,
  MapPinIcon
} from '@/components/icons/Icons';

const AdminDashboard: React.FC = () => {
  // Try to get language context, but provide fallback if not available
  let t = (key: string) => key; // Default fallback function
  try {
    const { t: translateFn } = useLanguage();
    t = translateFn;
  } catch (error) {
    console.log('Language context not available, using fallback');
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verification' | 'reports' | 'emergency' | 'analytics'>('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    pendingReports: 0,
    totalUsers: 0,
    activeEmergencies: 0,
    uptime: 0,
    avgResponse: 0,
    dailyActive: 0,
    errorRate: 0
  });
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [emergencyForm, setEmergencyForm] = useState({
    title: '',
    message: '',
    severity: 'high',
    targetCity: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, verificationsData, reportsData, usersData, activityData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getVerificationQueue({ limit: 10 }),
        adminAPI.getReports({ limit: 10, status: 'pending' }),
        adminAPI.getUsers({ limit: 10 }).catch(() => ({ users: [] })),
        adminAPI.getRecentActivity({ limit: 5 }).catch(() => ({ activities: [] }))
      ]);
      
      setStats({
        pendingVerifications: statsData.pendingVerifications || 0,
        pendingReports: statsData.pendingReports || 0,
        totalUsers: statsData.totalUsers || 0,
        activeEmergencies: statsData.activeEmergencies || 0,
        uptime: statsData.uptime || 0,
        avgResponse: statsData.avgResponse || 0,
        dailyActive: statsData.dailyActive || 0,
        errorRate: statsData.errorRate || 0
      });
      setVerificationQueue(verificationsData.users || []);
      setReports(reportsData.reports || []);
      setUsers(usersData.users || []);
      setRecentActivity(activityData.activities || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleVerificationAction = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      await adminAPI.updateVerificationStatus(userId, status);
      await loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Failed to update verification:', error);
    }
  };

  const handleReportAction = async (reportId: string, status: 'resolved' | 'dismissed', resolution?: string) => {
    try {
      await adminAPI.updateReport(reportId, { status, resolution });
      await loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const handleEmergencyBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await adminAPI.createEmergencyAlert(emergencyForm);
      alert(`Emergency broadcast sent to ${result.recipientCount} users!`);
      setEmergencyForm({ title: '', message: '', severity: 'high', targetCity: '' });
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      alert('Failed to send emergency alert');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      case 'dismissed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statsDisplay = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: UsersIcon, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      label: 'Pending Verifications', 
      value: stats.pendingVerifications, 
      icon: ShieldCheckIcon, 
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      change: '-5%',
      changeType: 'negative'
    },
    { 
      label: 'Open Reports', 
      value: stats.pendingReports, 
      icon: FlagIcon, 
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      change: '+3%',
      changeType: 'positive'
    },
    { 
      label: 'Active Emergencies', 
      value: stats.activeEmergencies, 
      icon: AlertTriangleIcon, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: '0%',
      changeType: 'neutral'
    }
  ];

  const systemHealthMetrics = [
    {
      label: 'System Uptime',
      value: stats.uptime ? `${stats.uptime}%` : '0%',
      icon: ServerIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Avg Response Time',
      value: stats.avgResponse ? `${stats.avgResponse}ms` : '0ms',
      icon: ZapIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Daily Active Users',
      value: stats.dailyActive || 0,
      icon: ActivityIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Error Rate',
      value: stats.errorRate ? `${stats.errorRate}%` : '0%',
      icon: TrendingUpIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  if (loading && !verificationQueue.length) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <SettingsIcon size={24} className="text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Manage platform operations and monitor system health</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCwIcon size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <DownloadIcon size={18} />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'text-emerald-700 bg-emerald-100' :
                  stat.changeType === 'negative' ? 'text-red-700 bg-red-100' :
                  'text-gray-700 bg-gray-100'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <ServerIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <p className="text-sm text-gray-500">Real-time platform performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-600">All Systems Operational</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealthMetrics.map((metric, index) => (
              <div key={index} className={`${metric.bgColor} rounded-xl p-4 text-center`}>
                <div className={`w-8 h-8 ${metric.color} mx-auto mb-3 flex items-center justify-center`}>
                  <metric.icon size={20} />
                </div>
                <p className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: PieChartIcon },
                { id: 'users', label: 'User Management', icon: UsersIcon },
                { id: 'verification', label: 'Verifications', icon: ShieldCheckIcon },
                { id: 'reports', label: 'Reports', icon: FlagIcon },
                { id: 'emergency', label: 'Emergency Alerts', icon: AlertTriangleIcon },
                { id: 'analytics', label: 'Analytics', icon: BarChartIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} />
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
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('verification')}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheckIcon size={24} className="text-blue-600" />
                      <span className="font-semibold text-gray-900">Review Verifications</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats.pendingVerifications} NGOs waiting for verification
                    </p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className="p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FlagIcon size={24} className="text-red-600" />
                      <span className="font-semibold text-gray-900">Handle Reports</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats.pendingReports} reports need attention
                    </p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('emergency')}
                    className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <BellIcon size={24} className="text-amber-600" />
                      <span className="font-semibold text-gray-900">Send Alert</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Broadcast emergency notifications
                    </p>
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ActivityIcon size={20} />
                      Recent Activity
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            activity.type === 'verification' ? 'bg-emerald-100' :
                            activity.type === 'report' ? 'bg-red-100' :
                            activity.type === 'emergency' ? 'bg-amber-100' : 'bg-blue-100'
                          }`}>
                            {activity.type === 'verification' ? (
                              <CheckIcon size={20} className="text-emerald-600" />
                            ) : activity.type === 'report' ? (
                              <FlagIcon size={20} className="text-red-600" />
                            ) : activity.type === 'emergency' ? (
                              <AlertTriangleIcon size={20} className="text-amber-600" />
                            ) : (
                              <EyeIcon size={20} className="text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <ClockIcon size={14} />
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileTextIcon size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                {/* Users List */}
                <div className="space-y-3">
                  {users.length > 0 ? (
                    users.map((user: any) => (
                      <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              {user.isVerified && (
                                <ShieldCheckIcon size={16} className="text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'organizer' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {user.role}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <EyeIcon size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XIcon size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersIcon size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">NGO Verification Queue</h3>
                    <p className="text-gray-600">Review and verify organization applications</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ClockIcon size={16} />
                    {stats.pendingVerifications} pending
                  </div>
                </div>
                
                {verificationQueue.length > 0 ? (
                  <div className="space-y-4">
                    {verificationQueue.map((item: any) => (
                      <div key={item._id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {item.organizationName?.charAt(0)?.toUpperCase() || 'N'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {item.organizationName || item.name}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon size={14} />
                                  Applied {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPinIcon size={14} />
                                  {item.profile?.city || 'Location not specified'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.organizationVerificationStatus)}`}>
                                  {item.organizationVerificationStatus.replace('_', ' ')}
                                </span>
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                  NGO
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleVerificationAction(item._id, 'verified')}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              <CheckIcon size={16} />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVerificationAction(item._id, 'rejected')}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <XIcon size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheckIcon size={40} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No pending NGO verifications at the moment</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User Reports</h3>
                    <p className="text-gray-600">Review and moderate reported content</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FlagIcon size={16} />
                    {stats.pendingReports} pending
                  </div>
                </div>
                
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report._id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              report.type === 'user' ? 'bg-purple-100' :
                              report.type === 'opportunity' ? 'bg-blue-100' : 'bg-orange-100'
                            }`}>
                              <FlagIcon size={24} className={
                                report.type === 'user' ? 'text-purple-600' :
                                report.type === 'opportunity' ? 'text-blue-600' : 'text-orange-600'
                              } />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{report.targetId}</h4>
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded font-medium">
                                  {report.type}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{report.reason}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Reported by {report.reportedBy?.name}</span>
                                <span>•</span>
                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </span>
                            {report.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleReportAction(report._id, 'resolved', 'Issue resolved by admin')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                                >
                                  <CheckIcon size={14} />
                                  Resolve
                                </button>
                                <button 
                                  onClick={() => handleReportAction(report._id, 'dismissed', 'Report dismissed - no violation found')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                >
                                  <XIcon size={14} />
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckIcon size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending reports</h3>
                    <p className="text-gray-500">All user reports have been reviewed</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="max-w-3xl">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangleIcon size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 text-lg mb-2">Emergency Broadcast System</h4>
                      <p className="text-red-600 mb-3">
                        Send urgent alerts to volunteers in specific areas. This will trigger push notifications, 
                        SMS alerts, and in-app notifications to help coordinate emergency response efforts.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-red-700">
                        <span className="flex items-center gap-1">
                          <BellIcon size={14} />
                          Push Notifications
                        </span>
                        <span className="flex items-center gap-1">
                          <SendIcon size={14} />
                          SMS Alerts
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon size={14} />
                          Location Targeting
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEmergencyBroadcast} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Alert Title *</label>
                      <input
                        type="text"
                        value={emergencyForm.title}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                        placeholder="e.g., Flood Emergency - Immediate Volunteer Response Needed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Severity Level *</label>
                      <select
                        value={emergencyForm.severity}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🟠 High Priority</option>
                        <option value="critical">🔴 Critical Emergency</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Target Location</label>
                      <select
                        value={emergencyForm.targetCity}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, targetCity: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">🌍 All Cities (Nationwide)</option>
                        <option value="Douala">📍 Douala</option>
                        <option value="Yaoundé">📍 Yaoundé</option>
                        <option value="Buea">📍 Buea</option>
                        <option value="Limbe">📍 Limbe</option>
                        <option value="Bamenda">📍 Bamenda</option>
                        <option value="Kribi">📍 Kribi</option>
                        <option value="Bafoussam">📍 Bafoussam</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Emergency Message *</label>
                    <textarea
                      value={emergencyForm.message}
                      onChange={(e) => setEmergencyForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Provide clear instructions for volunteers:
• What is the emergency situation?
• What specific help is needed?
• Where should volunteers report?
• What should they bring?
• Emergency contact information"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Be specific and actionable. Include meeting points, required supplies, and contact information.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangleIcon size={16} className="text-amber-600" />
                      <span className="font-medium text-amber-800">Preview Recipients</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      This alert will be sent to approximately <strong>
                      {emergencyForm.targetCity ? '500-1,500' : '2,000-5,000'}
                      </strong> active volunteers {emergencyForm.targetCity ? `in ${emergencyForm.targetCity}` : 'nationwide'}.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
                  >
                    <SendIcon size={20} />
                    {loading ? 'Broadcasting Emergency Alert...' : 'Send Emergency Broadcast'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Analytics</h3>
                  <p className="text-gray-600">Comprehensive insights into platform performance and user engagement</p>
                </div>

                {/* Coming Soon */}
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChartIcon size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics Coming Soon</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We're building comprehensive analytics dashboards with user engagement metrics, 
                    volunteer activity trends, and platform performance insights.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <PieChartIcon size={24} className="text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">User Demographics</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <TrendingUpIcon size={24} className="text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Growth Metrics</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <ActivityIcon size={24} className="text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Engagement Rates</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                      <MapPinIcon size={24} className="text-amber-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Geographic Data</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
