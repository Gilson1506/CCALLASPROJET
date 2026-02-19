import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function Calendar() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const [dates, setDates] = useState<any[]>([]);
  const [calendarFile, setCalendarFile] = useState<{ url: string, file_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Dates
      const { data: datesData, error: datesError } = await supabase
        .from('calendar_dates')
        .select('*')
        .order('sort_order', { ascending: true });

      if (datesError) throw datesError;
      setDates(datesData || []);

      // 2. Fetch File Config
      const { data: configData, error: configError } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'calendar_file')
        .single();

      if (!configError && configData?.value) {
        setCalendarFile(configData.value);
      }

    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (calendarFile?.url) {
      window.open(calendarFile.url, '_blank');
    } else {
      alert('Calendário PDF ainda não disponível.');
    }
  };

  useEffect(() => {
    if (loading || dates.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation with letter stagger
      if (headingRef.current) {
        const letters = headingRef.current.querySelectorAll('.letter');
        gsap.fromTo(
          letters,
          { opacity: 0, y: 50, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // Cards animation with 3D depth
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.calendar-card');
        cards.forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              translateZ: -500,
              rotateY: index % 2 === 0 ? -15 : 15,
            },
            {
              opacity: 1,
              translateZ: 100 - index * 50,
              rotateY: 0,
              duration: 0.7,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
              },
              delay: 0.3 + index * 0.1,
            }
          );
        });
      }

      // CTA button animation
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 50%',
            },
            delay: 0.9,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, dates]);

  // Split heading into letters
  const letters = 'Calendário 2026'.split('');

  return (
    <section
      id="calendario"
      ref={sectionRef}
      className="relative py-12 lg:py-16 bg-white overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-[#89CFF0]/8 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-[#6BB8E8]/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="text-center mb-12" style={{ perspective: '1000px' }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] font-['Montserrat']">
              {letters.map((letter, index) => (
                <span
                  key={index}
                  className="letter inline-block"
                  style={{
                    transformStyle: 'preserve-3d',
                    color: letter === ' ' ? 'transparent' : undefined,
                    width: letter === ' ' ? '0.3em' : undefined,
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </h2>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-[#4A90D9] to-[#89CFF0] mx-auto rounded-full" />
          </div>

          {/* Calendar Cards - Grid on Mobile, Horizontal on Desktop */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
            </div>
          ) : (
            <div
              ref={cardsRef}
              className="relative lg:overflow-x-auto lg:pb-4"
              style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:flex lg:gap-6 lg:justify-center lg:min-w-max lg:px-4">
                {dates.map((date, index) => (
                  <div
                    key={date.id || index}
                    className="calendar-card group relative"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `translateZ(${100 - index * 50}px)`,
                    }}
                  >
                    <div className="relative w-full lg:w-56 bg-white overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#89CFF0]/20 transition-all duration-300 hover:-translate-y-2 hover:scale-105 border border-[#e0eaf5]">
                      {/* Card Header - Image instead of Icon */}
                      <div className="bg-gradient-to-br from-[#4A90D9] to-[#6BB8E8] h-32 overflow-hidden">
                        <img
                          src={date.image || `/event-${date.event_name?.toLowerCase() || 'default'}.jpg`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200?text=Event';
                          }}
                          alt={date.event_name}
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>

                      {/* Card Body */}
                      <div className="p-4 text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-[#4A90D9] font-['Montserrat']">
                          {date.year}
                        </div>
                        <div className="text-lg font-bold text-[#1a1a1a] mt-2 font-['Montserrat']">
                          {date.month}
                        </div>
                        <div className="text-sm text-[#6c757d] font-['Open_Sans'] mt-1">
                          {date.days}
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#e0eaf5]">
                          <span className="inline-block px-3 py-1 bg-[#89CFF0]/10 rounded-full text-xs font-semibold text-[#4A90D9]">
                            {date.event_name}
                          </span>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#89CFF0]/0 to-[#4A90D9]/0 group-hover:from-[#89CFF0]/5 group-hover:to-[#4A90D9]/5 transition-all duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center mt-8">
            <button
              ref={ctaRef}
              onClick={handleDownload}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#4A90D9] to-[#6BB8E8] text-white rounded-full font-semibold font-['Montserrat'] shadow-lg hover:shadow-xl hover:shadow-[#89CFF0]/30 transition-all duration-300 hover:scale-105"
            >
              <Download className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" />
              <span>{calendarFile?.file_name ? `Baixar ${calendarFile.file_name}` : 'Baixar Calendário'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
