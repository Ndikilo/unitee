import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NewAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Award,
  Clock,
  Users,
  Heart,
  Settings,
  Shield,
  Loader2
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    avatar?: string;
    phone?: string;
    city?: string;
    country?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    dateOfBirth?: string;
  };
  organizationName?: string;
  organizationDescription?: string;
  organizationWebsite?: string;
  stats: {
    totalHours: number;
    totalEvents: number;
    peopleHelped: number;
    badges: Array<{
      name: string;
      description: string;
      icon: string;
      earnedAt: string;
    }>;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    emergencyAlerts: boolean;
    language: string;
  };
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setUser(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await authAPI.updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setIsEditing(false);
    setError('');
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skills = [...(formData.profile?.skills || []), newSkill.trim()];
      setFormData({
        ...formData,
        profile: { ...formData.profile, skills }
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const skills = formData.profile?.skills?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      profile: { ...formData.profile, skills }
    });
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      const interests = [...(formData.profile?.interests || []), newInterest.trim()];
      setFormData({
        ...formData,
        profile: { ...formData.profile, interests }
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    const interests = formData.profile?.interests?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      profile: { ...formData.profile, interests }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Failed to load profile. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Award className="h-4 w-4 mr-2" />
            Stats & Badges
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'organizer' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.emailVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? formData.name : user.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={isEditing ? (formData.profile?.phone || '') : (user.profile.phone || '')}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, phone: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={isEditing 
                      ? (formData.profile?.dateOfBirth ? new Date(formData.profile.dateOfBirth).toISOString().split('T')[0] : '')
                      : (user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '')
                    }
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, dateOfBirth: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={isEditing ? (formData.profile?.city || '') : (user.profile.city || '')}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, city: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Yaoundé"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={isEditing ? (formData.profile?.country || 'Cameroon') : (user.profile.country || 'Cameroon')}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: { ...formData.profile, country: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? (formData.profile?.bio || '') : (user.profile.bio || '')}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, bio: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Info (for organizers) */}
          {user.role === 'organizer' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Details about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={isEditing ? (formData.organizationName || '') : (user.organizationName || '')}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgWebsite">Website</Label>
                  <Input
                    id="orgWebsite"
                    value={isEditing ? (formData.organizationWebsite || '') : (user.organizationWebsite || '')}
                    onChange={(e) => setFormData({ ...formData, organizationWebsite: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgDescription">Description</Label>
                  <Textarea
                    id="orgDescription"
                    value={isEditing ? (formData.organizationDescription || '') : (user.organizationDescription || '')}
                    onChange={(e) => setFormData({ ...formData, organizationDescription: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Describe your organization..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Interests</CardTitle>
              <CardDescription>What you're good at and what you care about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills */}
              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(isEditing ? formData.profile?.skills : user.profile.skills)?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                  {(isEditing ? formData.profile?.skills?.length === 0 : user.profile.skills?.length === 0) && (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(isEditing ? formData.profile?.interests : user.profile.interests)?.map((interest, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(index)}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                  {(isEditing ? formData.profile?.interests?.length === 0 : user.profile.interests?.length === 0) && (
                    <p className="text-sm text-gray-500">No interests added yet</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    />
                    <Button type="button" onClick={handleAddInterest} variant="outline">
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats & Badges Tab */}
        <TabsContent value="stats" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-3xl font-bold mt-1">{user.stats.totalHours}</p>
                  </div>
                  <Clock className="h-12 w-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Events Attended</p>
                    <p className="text-3xl font-bold mt-1">{user.stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">People Helped</p>
                    <p className="text-3xl font-bold mt-1">{user.stats.peopleHelped}</p>
                  </div>
                  <Heart className="h-12 w-12 text-red-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>Recognition for your contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {user.stats.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.stats.badges.map((badge, index) => (
                    <div key={index} className="border rounded-lg p-4 flex items-start gap-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-semibold">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">No badges earned yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Participate in volunteer opportunities to earn badges!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotif">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={isEditing ? formData.preferences?.emailNotifications : user.preferences.emailNotifications}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, emailNotifications: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotif">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via SMS</p>
                </div>
                <Switch
                  id="smsNotif"
                  checked={isEditing ? formData.preferences?.smsNotifications : user.preferences.smsNotifications}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, smsNotifications: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emergencyAlerts">Emergency Alerts</Label>
                  <p className="text-sm text-gray-500">Receive urgent community alerts</p>
                </div>
                <Switch
                  id="emergencyAlerts"
                  checked={isEditing ? formData.preferences?.emergencyAlerts : user.preferences.emergencyAlerts}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, emergencyAlerts: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/settings'}>
                Change Password
              </Button>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Account Status</p>
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Email Not Verified
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Account Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
