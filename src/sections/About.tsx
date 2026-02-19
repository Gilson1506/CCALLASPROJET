import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Heart, Lightbulb, Users, Shield, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const values = [
  { icon: Target, label: 'Profissionalismo' },
  { icon: Heart, label: 'Excelência' },
  { icon: Users, label: 'Colaboração' },
  { icon: Shield, label: 'Responsabilidade' },
  { icon: Sparkles, label: 'Compromisso' },
  { icon: Lightbulb, label: 'Inovação' },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: configData, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'about_info')
        .single();

      if (error) throw error;
      if (configData) setAboutData(configData.value);
    } catch (err) {
      console.error('Error fetching about data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Label animation
      if (labelRef.current) {
        gsap.fromTo(
          labelRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          {
            opacity: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.7,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
            delay: 0.1,
          }
        );
      }

      // Text animation
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
            delay: 0.2,
          }
        );
      }

      // Mission card animation
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current,
          { opacity: 0, rotateX: 45, y: 50 },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.4,
          }
        );
      }

      // Values card animation
      if (valuesRef.current) {
        gsap.fromTo(
          valuesRef.current,
          { opacity: 0, rotateX: 45, y: 50 },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.55,
          }
        );
      }

      // Image animation
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, rotateY: -30, x: 100 },
          {
            opacity: 1,
            rotateY: 0,
            x: 0,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.3,
          }
        );

        // Parallax on scroll
        gsap.to(imageRef.current, {
          y: -50,
          rotateY: 5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading]);

  return (
    <section
      id="sobre"
      ref={sectionRef}
      className="relative py-6 lg:py-10 overflow-hidden"
    >
      {/* Background Image - Full Opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/OQCI430.jpg)',
        }}
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 mb-4">
        <div className="max-w-4xl mx-auto">
          {/* Content - Now Full Width */}
          <div>
            {/* Section Label */}
            <div ref={labelRef} className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold font-['Montserrat']">Sobre</span>
            </div>

            {/* Heading */}
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-['Montserrat'] drop-shadow-lg"
            >
              {aboutData?.title || 'Sobre Nós'}
            </h2>

            {/* Description */}
            <div
              ref={textRef}
              className="text-white/90 text-base leading-relaxed mb-6 font-['Open_Sans'] drop-shadow-md whitespace-pre-line"
            >
              {loading ? (
                'Carregando informações...'
              ) : (
                aboutData?.description || 'A Arena Eventos Pro é referência no mercado angolano.'
              )}
            </div>

            {/* Cards - Horizontal Layout - Borderless */}
            <div className="flex flex-col sm:flex-row gap-6 max-w-5xl mx-auto" style={{ perspective: '1000px' }}>
              {/* Mission Card */}
              <div
                ref={missionRef}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-['Montserrat']">
                    Missão
                  </h3>
                  <div className="text-white/80 text-xs leading-relaxed font-['Open_Sans']">
                    {aboutData?.mission || 'Posicionar-se como parceiro na construção de processos de modernização.'}
                  </div>
                </div>
              </div>

              {/* Values Card */}
              <div
                ref={valuesRef}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white/15"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-['Montserrat']">
                    Valores
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white/15 backdrop-blur-sm rounded-md text-xs text-white font-medium hover:bg-white/25 transition-colors duration-200"
                      >
                        <value.icon className="w-3 h-3" />
                        {value.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Oblique Divider (Bottom) - Professional Subtle Angle */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
    </section>
  );
}
