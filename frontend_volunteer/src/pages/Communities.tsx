import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MapPin, 
  Search, 
  SlidersHorizontal,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { communityAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Community {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: {
    city: string;
    country: string;
  };
  image?: string;
  website?: string;
  contactEmail?: string;
  members: any[];
  stats: {
    totalOpportunities: number;
    totalVolunteers: number;
    totalHours: number;
  };
  verificationStatus: string;
  isMember?: boolean;
  createdAt: string;
}

const categories = [
  'Environment',
  'Education',
  'Healthcare',
  'Humanitarian',
  'Social Services',
  'Economic Development'
];

const Communities: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCommunities();
  }, [currentPage, searchQuery, selectedCategory, selectedCity]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCity) params.city = selectedCity;

      const response = await communityAPI.getAll(params);
      setCommunities(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalCount(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load communities');
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const CommunityCard = ({ community }: { community: Community }) => {
    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => navigate(`/community/${community._id}`)}
      >
        {community.image && (
          <div className="h-48 overflow-hidden rounded-t-lg">
            <img 
              src={community.image} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary">{community.category}</Badge>
            {community.verificationStatus === 'verified' && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-1">{community.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {community.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {community.location.city}, {community.location.country}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {community.stats.totalVolunteers} members
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {community.stats.totalOpportunities} opportunities
          </div>
          
          {community.isMember && (
            <Badge className="w-full justify-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Member
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Communities</h1>
        <p className="text-gray-600">
          Connect with organizations making a difference in Cameroon
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="px-6">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
            </div>
          )}

          {(searchQuery || selectedCategory || selectedCity) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {totalCount} {totalCount === 1 ? 'community' : 'communities'} found
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
      {!loading && !error && communities.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No communities found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        </Card>
      )}

      {/* Communities Grid */}
      {!loading && !error && communities.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(community => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Communities;
