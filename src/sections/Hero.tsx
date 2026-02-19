import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

import { supabase } from '../lib/supabase';

// Slideshow backgrounds with Unsplash placeholder images
const defaultSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
    title: 'Feiras Multisectoriais',
    subtitle: 'Conectando Negócios' // Added subtitle structure for consistent data shape if needed
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop',
    title: 'Eventos Corporativos',
    subtitle: 'Experiências Únicas'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
    title: 'Exposições Premium',
    subtitle: 'Inovação e Criatividade'
  },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [slides, setSlides] = useState<any[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchFeaturedFairs();
  }, []);

  const fetchFeaturedFairs = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('fairs')
        .select('*')
        .eq('is_hero_featured', true)
        .order('sort_order', { ascending: true });

      if (data && data.length > 0) {
        const mappedSlides = data.map((fair: any) => ({
          id: fair.id,
          image: fair.image,
          title: fair.full_name || fair.name,
          subtitle: fair.name // Using short name as subtitle/tag
        }));
        setSlides(mappedSlides);
      }
    } catch (err) {
      console.error('Error fetching hero slides:', err);
    }
  };

  const nextSlide = useCallback(() => {
    setSlides(prevSlides => {
      // Functional update to avoid dependency on slides state directly
      return prevSlides;
    });
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length <= 1) return; // Don't auto-advance if only 1 slide
    slideIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [nextSlide, slides.length]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Main Content Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple fade up for main content
      gsap.fromTo(
        mainContentRef.current?.querySelectorAll('.animate-item') || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.2 // Small delay for smoothness on load
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Slideshow Background */}
      <div ref={slidesRef} className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
            style={{
              opacity: currentSlide === index ? 1 : 0,
              zIndex: currentSlide === index ? 1 : 0,
              transform: currentSlide === index ? 'scale(1)' : 'scale(1.1)',
            }}
          >
            {/* Image Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />
            {/* Clean, Transparent Overlay as requested */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Main Content (Centered) */}
      <div
        ref={mainContentRef}
        className="relative z-20 w-full px-6"
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">

          {/* Main Title with Floating Letters - Text Border & Gradient Fill */}
          <h1 className="animate-item text-3xl sm:text-4xl lg:text-6xl font-bold font-['Montserrat'] leading-tight mb-8 drop-shadow-lg opacity-0">
            <span
              className="block mb-2 text-stroke-blue bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent"
              style={{ paddingBottom: '0.1em' }} // Prevent descender clipping
            >
              {"Criamos Eventos".split('').map((letter, index) => (
                <span
                  key={index}
                  className="floating-letter inline-block"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </span>
            <span
              className="block mb-2 text-stroke-blue bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent"
              style={{ paddingBottom: '0.1em' }}
            >
              {"que Marcam Gerações".split('').map((letter, index) => (
                <span
                  key={index}
                  className="floating-letter inline-block"
                  style={{
                    animationDelay: `${(index + 14) * 0.1}s`,
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </span>
            <span
              className="block text-stroke-blue bg-gradient-to-b from-white to-gray-200 bg-clip-text text-transparent"
              style={{ paddingBottom: '0.1em' }}
            >
              {"e Transformam Negócios".split('').map((letter, index) => (
                <span
                  key={index}
                  className="floating-letter inline-block"
                  style={{
                    animationDelay: `${(index + 35) * 0.1}s`,
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </span>
              ))}
            </span>
          </h1>

          {/* CTA Buttons - Improved Mobile Styling */}
          <div className="animate-item flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto opacity-0">
            <button
              onClick={() => scrollToSection('#eventos')}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-6 sm:py-3 bg-white text-[#0066CC] rounded-xl font-bold text-base sm:text-sm font-['Montserrat'] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 shadow-lg"
            >
              <span className="relative z-10">Explorar Eventos</span>
              <ArrowRight className="relative z-10 w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => scrollToSection('#sobre')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-6 sm:py-3 bg-[#0066CC] text-white rounded-xl font-bold text-base sm:text-sm font-['Montserrat'] backdrop-blur-sm transition-all duration-300 hover:bg-[#0055AA] hover:shadow-xl hover:scale-105 active:scale-95 border border-white/10 shadow-lg"
            >
              <Play className="w-5 h-5 sm:w-4 sm:h-4 fill-current" />
              <span>Conhecer Mais</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Fade REMOVED per request */}
    </section>
  );
}
