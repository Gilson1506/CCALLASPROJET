import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/swiper-bundle.css';

gsap.registerPlugin(ScrollTrigger);

export default function OtherEvents() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOtherEvents();
  }, []);

  const fetchOtherEvents = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false }) // Or sorted by date
        .limit(10);

      if (error) throw error;

      if (data) {
        setEvents(data.map((e: any) => ({
          id: e.id,
          name: e.title,
          description: e.description,
          image: e.cover_image
        })));
      }
    } catch (err) {
      console.error('Error fetching other events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || events.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // Carousel animation
      if (carouselRef.current) {
        gsap.fromTo(
          carouselRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.2,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, events]);

  if (loading) {
    return (
      <section className="py-24 bg-[#f0f7ff] flex justify-center">
        <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
      </section>
    );
  }

  if (events.length === 0) return null;

  const activeEvent = events[activeIndex] || events[0];

  return (
    <section
      id="outros-eventos"
      ref={sectionRef}
      className="relative py-12 lg:py-16 bg-[#f0f7ff] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f0f7ff] via-[#4A90D9]/5 to-[#f0f7ff]" />

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A90D9]/10 mb-4">
              <Calendar className="w-4 h-4 text-[#4A90D9]" />
              <span className="text-sm font-semibold text-[#4A90D9] font-['Montserrat']">
                Mais Eventos
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1a] font-['Montserrat']">
              OUTROS{' '}
              <span className="gradient-text">EVENTOS</span>
            </h2>
            <div className="mt-4 w-32 h-1 bg-gradient-to-r from-[#4A90D9] to-[#89CFF0] mx-auto rounded-full" />
          </div>

          {/* Swiper Carousel - Horizontal Coverflow */}
          <div ref={carouselRef} className="relative">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2.5,
                slideShadows: false,
              }}
              autoplay={{
                delay: 10000,
                disableOnInteraction: false,
              }}
              loop={events.length > 2} // Only loop if enough slides
              modules={[EffectCoverflow, Pagination, Autoplay]}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              className="w-full"
              style={{
                paddingTop: '20px',
                paddingBottom: '60px',
              }}
            >
              {events.map((event) => (
                <SwiperSlide
                  key={event.id}
                  style={{
                    width: '350px',
                    height: '450px',
                  }}
                  onClick={() => navigate(`/eventos/${event.id}`)}
                >
                  <div className="w-full h-full bg-gray-100 shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer group">
                    <img
                      src={event.image || 'https://via.placeholder.com/350x450'}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Active Event Info - Above Pagination */}
            <div className="text-center mt-8 mb-4 min-h-[100px] transition-all duration-300 px-4">
              <h3
                className="text-2xl font-bold text-[#1a1a1a] mb-2 font-['Montserrat'] cursor-pointer hover:text-[#4A90D9] transition-colors"
                onClick={() => activeEvent && navigate(`/eventos/${activeEvent.id}`)}
              >
                {activeEvent?.name}
              </h3>
              <p className="text-[#6c757d] text-sm leading-relaxed font-['Open_Sans'] max-w-md mx-auto line-clamp-3">
                {activeEvent?.description}
              </p>
            </div>

            {/* Custom Pagination Dots */}
            <div className="flex justify-center gap-2 flex-wrap px-4">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => swiperInstance?.slideToLoop(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                    ? 'w-8 bg-[#4A90D9]'
                    : 'bg-[#4A90D9]/30 hover:bg-[#4A90D9]/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
