import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Award,
  MessageSquare
} from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  _id: string;
  user: string;
  type: 'application' | 'opportunity' | 'community' | 'system' | 'emergency' | 'badge';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationAPI.getAll({
        unreadOnly: filter === 'unread'
      });
      setNotifications(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to mark all as read",
        variant: "destructive",
      });
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationAPI.delete(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'opportunity':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'community':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'badge':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'emergency':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </>
              )}
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            {filter === 'unread' ? (
              <BellOff className="h-16 w-16 mx-auto" />
            ) : (
              <Bell className="h-16 w-16 mx-auto" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? 'All caught up! Check back later for updates.'
              : 'When you get notifications, they will appear here.'}
          </p>
        </Card>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification._id}
              className={`transition-all ${
                !notification.isRead ? 'border-l-4 ' + getPriorityColor(notification.priority) : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Badge variant="default" className="flex-shrink-0">
                          New
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
