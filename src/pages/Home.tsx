import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero from '../sections/Hero';
import About from '../sections/About';
import Calendar from '../sections/Calendar';
import Fairs from '../sections/Fairs';
import OtherEvents from '../sections/OtherEvents';
import Services from '../sections/Services';
import Partners from '../sections/Partners';
import Newsletter from '../sections/Newsletter';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const homeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize scroll-triggered animations for sections
        const ctx = gsap.context(() => {
            const sections = document.querySelectorAll('.animate-section');

            sections.forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0.9, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });
        }, homeRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={homeRef}>
            <Hero />
            <About />
            <Calendar />
            <Fairs />
            <OtherEvents />
            <Services />
            <Partners />
            <Newsletter />
        </div>
    );
}
