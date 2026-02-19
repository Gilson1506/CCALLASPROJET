import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Handshake, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

// Defina uma interface básica para evitar 'any'
interface Partner {
  id: string;
  name: string;
  logo: string;
}

export default function Partners() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const topBorderRef = useRef<HTMLDivElement>(null);
  const bottomBorderRef = useRef<HTMLDivElement>(null);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    // Verificação de segurança caso o supabase não esteja inicializado
    if (!supabase) {
      console.warn('Supabase client not initialized');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      if (data) {
        console.log('Partners fetched:', data); // Debug: veja o que vem do banco
        setPartners(data.map((p) => ({
          id: p.id,
          name: p.name,
          // CORREÇÃO 1: Use 'p.logo' em vez de 'p.logo_url'
          logo: p.logo
        })));
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || partners.length === 0) return;

    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, scale: 0.9 },
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

      // Border animations
      if (topBorderRef.current) {
        gsap.fromTo(
          topBorderRef.current,
          { width: '0%' },
          {
            width: '100%',
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
            delay: 0.2,
          }
        );
      }

      if (bottomBorderRef.current) {
        gsap.fromTo(
          bottomBorderRef.current,
          { width: '0%' },
          {
            width: '100%',
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
            delay: 0.7,
          }
        );
      }

      // Partner cards animation
      if (cardsRef.current) {
        const logos = cardsRef.current.querySelectorAll('.partner-card');
        gsap.fromTo(
          logos,
          { opacity: 0, scale: 0, rotateY: 90 },
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.3,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, partners]);

  const shouldAnimate = partners.length >= 5;
  const allPartners = shouldAnimate ? [...partners, ...partners] : partners;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-24 bg-[#f0f7ff] overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-[#89CFF0]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#6BB8E8]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div ref={headingRef} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A90D9]/10 mb-4">
              <Handshake className="w-4 h-4 text-[#4A90D9]" />
              <span className="text-sm font-semibold text-[#4A90D9] font-['Montserrat']">
                Parceiros
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] font-['Montserrat']">
              PARCEIROS DE <span className="gradient-text">CONFIANÇA</span>
            </h2>
            <p className="mt-3 text-[#6c757d] max-w-lg mx-auto font-['Open_Sans']">
              Empresas que confiam na Arena Eventos Pro para impulsionar os seus resultados
            </p>
          </div>

          {/* Marquee Container */}
          <div className="relative" style={{ perspective: '800px' }}>
            {/* Top Border */}
            <div
              ref={topBorderRef}
              className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-[#89CFF0]/40 to-transparent"
              style={{ width: '0%' }}
            />

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
              </div>
            ) : partners.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Nenhum parceiro encontrado.
              </div>
            ) : (
              <div className="overflow-hidden py-8">
                <div
                  ref={cardsRef}
                  // Certifique-se que essa classe existe no seu CSS global ou Tailwind
                  className={`flex ${shouldAnimate ? 'animate-marquee' : 'justify-center flex-wrap gap-8'}`}
                  style={{ width: shouldAnimate ? 'fit-content' : '100%' }}
                >
                  {allPartners.map((partner, index) => (
                    <div
                      key={`${partner.id}-${index}`}
                      className={`partner-card flex-shrink-0 ${shouldAnimate ? 'mx-6' : ''}`}
                      style={{
                        transformStyle: 'preserve-3d',
                        // Animação de flutuar apenas se não for marquee CSS puro para evitar conflito
                        animation: !shouldAnimate ? `float ${3 + (index % 3)}s ease-in-out infinite` : undefined,
                        animationDelay: !shouldAnimate ? `${index * 0.2}s` : undefined,
                      }}
                    >
                      <div className="relative w-44 h-28 bg-white shadow-md hover:shadow-xl hover:shadow-[#89CFF0]/20 transition-all duration-400 flex items-center justify-center group cursor-pointer hover:scale-110 hover:-translate-y-2 border border-[#e0eaf5] overflow-hidden rounded-xl">
                        {/* Logo Image - Full Card */}
                        <img
                          // CORREÇÃO 2: Removido encodeURI e verificação mais robusta
                          src={partner.logo && partner.logo.trim() !== '' ? partner.logo : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100"><rect width="150" height="100" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999">Partner</text></svg>'}
                          alt={partner.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image Load Error for:', partner.name, partner.logo);
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100"><rect width="150" height="100" fill="%23fee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23f00">Error</text></svg>';
                          }}
                        />

                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#89CFF0]/0 to-[#4A90D9]/0 group-hover:from-[#89CFF0]/5 group-hover:to-[#4A90D9]/5 transition-all duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Border */}
            <div
              ref={bottomBorderRef}
              className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-[#89CFF0]/40 to-transparent"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}