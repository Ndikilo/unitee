import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Community } from './CommunityCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/NewAuthContext';
import {
  UsersIcon,
  MapPinIcon,
  CalendarIcon,
  MessageCircleIcon,
  CheckIcon,
  SendIcon
} from '@/components/icons/Icons';

interface CommunityDetailModalProps {
  community: Community | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (id: string) => void;
  isJoined: boolean;
}

const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  community,
  isOpen,
  onClose,
  onJoin,
  isJoined
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'chat' | 'events'>('about');
  const [chatMessage, setChatMessage] = useState('');

  if (!community) return null;

  const mockMessages = [
    { id: 1, user: 'Marie N.', message: 'Welcome to all new members! Excited to have you here.', time: '2h ago', avatar: 'https://ui-avatars.com/api/?name=Marie+N&background=3b82f6&color=fff' },
    { id: 2, user: 'Jean P.', message: 'Don\'t forget about our cleanup event this Saturday!', time: '3h ago', avatar: 'https://ui-avatars.com/api/?name=Jean+P&background=10b981&color=fff' },
    { id: 3, user: 'Amina K.', message: 'I\'ll be there! Can we bring friends?', time: '3h ago', avatar: 'https://ui-avatars.com/api/?name=Amina+K&background=8b5cf6&color=fff' },
    { id: 4, user: 'Paul M.', message: 'Yes, everyone is welcome! The more the merrier.', time: '4h ago', avatar: 'https://ui-avatars.com/api/?name=Paul+M&background=f59e0b&color=fff' }
  ];

  const mockEvents = [
    { id: 1, title: 'Monthly Cleanup Drive', date: 'Jan 20, 2026', location: 'Central Park', attendees: 24 },
    { id: 2, title: 'Community Meeting', date: 'Jan 25, 2026', location: 'Community Center', attendees: 45 },
    { id: 3, title: 'Tree Planting Day', date: 'Feb 1, 2026', location: 'City Forest', attendees: 67 }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    // In a real app, this would send to Supabase
    setChatMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header Image */}
      <div className="relative h-48">
        <img
          src={community.image_url || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl font-bold text-white mb-1">{community.name}</h2>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <UsersIcon size={14} />
              {community.member_count} members
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon size={14} />
              {community.city}, {community.country || 'Cameroon'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'about', label: 'About' },
            { id: 'chat', label: t('comm.chat') },
            { id: 'events', label: t('comm.events') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
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

      {/* Content */}
      <div className="p-6">
        {activeTab === 'about' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this community</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {community.description || 'A vibrant community of volunteers working together to make a positive impact in our neighborhood.'}
            </p>

            {/* Join Button */}
            <button
              onClick={() => !isJoined && onJoin(community.id)}
              disabled={isJoined || !isAuthenticated}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                isJoined
                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isJoined ? (
                <>
                  <CheckIcon size={22} />
                  You're a Member
                </>
              ) : !isAuthenticated ? (
                'Sign in to Join'
              ) : (
                t('comm.join')
              )}
            </button>
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            {isJoined ? (
              <>
                {/* Messages */}
                <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{msg.user}</span>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <SendIcon size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MessageCircleIcon size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Join this community to access the group chat</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={14} />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon size={14} />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon size={14} />
                    {event.attendees} attending
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CommunityDetailModal;
