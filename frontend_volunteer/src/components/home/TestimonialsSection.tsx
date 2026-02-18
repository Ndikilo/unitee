import React, { useState, useEffect } from 'react';
import { opportunityAPI } from '@/lib/api';
import { StarIcon } from '@/components/icons/Icons';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
    city?: string;
    role: string;
    organization?: string;
  };
  opportunity: {
    title: string;
    organizer?: string;
  };
}

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await opportunityAPI.getTestimonials(3);
        setTestimonials(data.testimonials || []);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Voices from Our Community
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hear from volunteers and NGOs who are making a difference with UNITEE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Voices from Our Community
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Hear from volunteers and NGOs who are making a difference with UNITEE
            </p>
          </div>
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarIcon size={40} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Reviews Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to participate in volunteer opportunities and share your experience with the community.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Voices from Our Community
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real experiences from volunteers and NGOs making a difference with UNITEE
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon 
                    key={i} 
                    size={18} 
                    className={`${
                      i < testimonial.rating 
                        ? 'text-amber-400 fill-current' 
                        : 'text-gray-200'
                    }`} 
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                "{testimonial.comment}"
              </p>

              {/* Opportunity Context */}
              <div className="text-sm text-blue-600 mb-4 font-medium">
                {testimonial.opportunity.title}
                {testimonial.opportunity.organizer && (
                  <span className="text-gray-500"> • {testimonial.opportunity.organizer}</span>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.user.avatar ? (
                    <img
                      src={testimonial.user.avatar}
                      alt={testimonial.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    testimonial.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.user.role}
                    {testimonial.user.city && ` • ${testimonial.user.city}`}
                    {testimonial.user.organization && ` • ${testimonial.user.organization}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Have you participated in a volunteer opportunity? Share your experience!
          </p>
          <div className="text-sm text-gray-500">
            Reviews are automatically collected from volunteers who have attended events
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
