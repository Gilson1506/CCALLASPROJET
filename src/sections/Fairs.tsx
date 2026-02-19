import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function Fairs() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [fairs, setFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchFairs();
  }, []);

  // Automatic image cycling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const fetchFairs = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('fairs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setFairs(data.map((f: any) => ({
          id: f.id,
          name: f.name,
          fullName: f.full_name,
          description: f.description,
          image: f.image,
          hoverImage: f.hover_image // Map snake_case to camelCase
        })));
      }
    } catch (err) {
      console.error('Error fetching fairs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || fairs.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // Cards animation
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.fair-card');
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, fairs]);

  return (
    <section
      id="eventos"
      ref={sectionRef}
      className="relative py-12 lg:py-16 bg-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(135deg, #4A90D9 0%, transparent 50%, #6BB8E8 100%)`,
            opacity: 0.05,
          }}
        />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a1628]/5 mb-4">
              <Sparkles className="w-4 h-4 text-[#0a1628]" />
              <span className="text-sm font-semibold text-[#0a1628] font-['Montserrat']">
                Conexões que Transformam
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0a1628] font-['Montserrat'] uppercase">
              Networking e <span className="text-[#4A90D9]">Negócios</span>
            </h2>
            <div className="mt-4 w-32 h-1 bg-gradient-to-r from-[#0a1628] to-[#4A90D9] mx-auto rounded-full" />
          </div>

          {/* Fairs Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {fairs.map((fair, index) => (
                <div
                  key={fair.id}
                  className="fair-card relative group cursor-pointer"
                  style={{
                    marginTop: index % 3 === 1 ? '2rem' : '0',
                  }}
                  onClick={() => navigate(`/eventos`)} // Or /eventos/${fair.id} if logic exists
                >
                  <div className="relative h-80 overflow-hidden bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Main Image */}
                    <img
                      src={fair.image || 'https://via.placeholder.com/400x600?text=Feira'}
                      alt={fair.name}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentImageIndex === 0 ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Hover Image (Now Alternating Image) */}
                    <img
                      src={fair.hoverImage || fair.image || 'https://via.placeholder.com/400x600?text=Hover'}
                      alt={`${fair.name} - alternate`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentImageIndex === 1 ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Overlay - Still appears on HOVER for interaction */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <h3 className="text-white text-2xl font-bold font-['Montserrat']">
                        {fair.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
