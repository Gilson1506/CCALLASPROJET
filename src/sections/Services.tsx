import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, PartyPopper, Megaphone, Lightbulb, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: 1,
    title: 'Organização de Feiras',
    description: 'Planejamento e execução completa de feiras multisectoriais e especializadas.',
    icon: Building2,
    color: 'from-[#4A90D9] to-[#6BB8E8]',
  },
  {
    id: 2,
    title: 'Gestão de Eventos',
    description: 'Coordenação profissional de eventos corporativos, conferências e seminários.',
    icon: PartyPopper,
    color: 'from-purple-400 to-violet-500',
  },
  {
    id: 3,
    title: 'Marketing e Comunicação',
    description: 'Estratégias de divulgação e branding para maximizar o impacto do seu evento.',
    icon: Megaphone,
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 4,
    title: 'Consultoria Empresarial',
    description: 'Assessoria especializada para modernização e crescimento do seu negócio.',
    icon: Lightbulb,
    color: 'from-emerald-400 to-teal-500',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const subheadingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      }

      // Description animation
      if (descRef.current) {
        gsap.fromTo(
          descRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
            delay: 0.3,
          }
        );
      }

      // Subheading animation
      if (subheadingRef.current) {
        gsap.fromTo(
          subheadingRef.current,
          { opacity: 0, letterSpacing: '20px' },
          {
            opacity: 1,
            letterSpacing: '5px',
            duration: 0.5,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
            delay: 0.5,
          }
        );
      }

      // Cards fan out animation
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.service-card');

        // Initial stacked position
        gsap.set(cards, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 0.8,
          opacity: 0,
        });

        // Fan out on scroll
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 50%',
          onEnter: () => {
            cards.forEach((card, index) => {
              const positions = [
                { x: -300, y: -50, rotation: -15 },
                { x: -100, y: -20, rotation: -5 },
                { x: 100, y: -20, rotation: 5 },
                { x: 300, y: -50, rotation: 15 },
              ];
              const pos = positions[index];

              gsap.to(card, {
                x: pos.x,
                y: pos.y,
                rotation: pos.rotation,
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: 'expo.out',
                delay: index * 0.1,
              });
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="servicos"
      ref={sectionRef}
      className="relative py-12 lg:py-16 bg-[#f0f7ff] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#89CFF0]/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#6BB8E8]/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-6 font-['Montserrat']"
            >
              O Melhor Parceiro para o seu{' '}
              <span className="gradient-text">Negócio</span>
            </h2>
            <p
              ref={descRef}
              className="text-[#6c757d] text-lg max-w-3xl mx-auto leading-relaxed font-['Open_Sans']"
            >
              Posiciona-se como parceiro na construção de processos de modernização,
              crescimento e internacionalização das organizações angolanas
              proporcionando-lhes projectos que estimulem o mercado e dotando as
              organizações de maior competitividade.
            </p>
          </div>

          {/* Subheading */}
          <h3
            ref={subheadingRef}
            className="text-center text-xl sm:text-2xl font-bold text-[#4A90D9] mb-16 font-['Montserrat'] uppercase tracking-widest"
          >
            nossos serviços
          </h3>

          {/* Service Cards - Fan Out */}
          <div
            ref={cardsRef}
            className="relative h-96 flex items-center justify-center"
            style={{ perspective: '1500px' }}
          >
            {services.map((service, index) => (
              <div
                key={service.id}
                className="service-card absolute w-64 sm:w-72"
                style={{
                  transformStyle: 'preserve-3d',
                  zIndex: services.length - index,
                }}
              >
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-[#89CFF0]/30 transition-all duration-500 overflow-hidden border border-[#e0eaf5] h-[280px] hover:h-[400px]">
                  {/* Card Header - Now Blue/White with Vibrant Icon */}
                  <div className="h-24 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden border-b border-slate-100 group-hover:bg-[#f0f7ff] transition-colors duration-500">
                    <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}>
                      <service.icon className={`w-10 h-10`} style={{ stroke: "url(#gradient-" + service.id + ")" }} />
                      {/* SVG Gradient Definition for Icons */}
                      <svg width="0" height="0" className="absolute">
                        <linearGradient id={"gradient-" + service.id} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={service.color.includes('purple') ? '#c084fc' : service.color.includes('orange') ? '#fb923c' : service.color.includes('emerald') ? '#34d399' : '#4A90D9'} />
                          <stop offset="100%" stopColor={service.color.includes('violet') ? '#8b5cf6' : service.color.includes('amber') ? '#f59e0b' : service.color.includes('teal') ? '#14b8a6' : '#6BB8E8'} />
                        </linearGradient>
                      </svg>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col h-full">
                    <h4 className="text-lg font-bold text-[#1a1a1a] mb-2 font-['Montserrat'] text-center group-hover:text-[#4A90D9] transition-colors duration-300">
                      {service.title}
                    </h4>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col justify-between flex-grow">
                      <p className="text-[#6c757d] text-sm leading-relaxed mb-4 font-['Open_Sans'] text-center">
                        {service.description}
                      </p>
                      <button className="w-full py-2 bg-[#4A90D9] text-white rounded-lg font-semibold text-sm hover:bg-[#357abd] transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span>Saber Mais</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Initial State Hint (Visible when not hovered) */}
                    <div className="absolute bottom-6 left-0 w-full text-center group-hover:opacity-0 transition-opacity duration-300">
                      <div className="w-8 h-1 bg-[#e2e8f0] rounded-full mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
