import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpportunityGrid from '@/components/opportunities/OpportunityGrid';
import BackButton from '@/components/ui/BackButton';
import { opportunityAPI } from '@/lib/api';
import { useAuth } from '@/contexts/NewAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Opportunities: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingRec(true);
    opportunityAPI.getRecommended(4)
      .then((data: any) => setRecommended(Array.isArray(data) ? data : []))
      .catch(() => setRecommended([]))
      .finally(() => setLoadingRec(false));
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Volunteer Opportunities</h1>
        <p className="text-gray-600">
          Find meaningful ways to make a difference in your community
        </p>
      </div>

      {/* Recommended section */}
      {isAuthenticated && (loadingRec || recommended.length > 0) && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
          </div>
          {loadingRec ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-4 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-4 w-3/4" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.map((opp: any) => (
                <Card
                  key={opp._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-blue-100 hover:border-blue-300"
                  onClick={() => navigate(`/opportunity/${opp._id}`)}
                >
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-1 text-xs">{opp.category}</Badge>
                    <CardTitle className="text-base line-clamp-1">{opp.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{opp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1">
                    {opp.location?.city && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />{opp.location.city}
                      </div>
                    )}
                    {opp.dateTime?.start && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(opp.dateTime.start).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <OpportunityGrid />
    </div>
  );
};

export default Opportunities;
