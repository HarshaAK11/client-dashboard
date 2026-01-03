"use client";

import { useEffect, useRef } from 'react';
import { gsapAnimations } from '@/lib/gsap-animations';

export function useGSAPHover() {
    const ref = useRef<any>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseEnter = () => gsapAnimations.buttonHover(el);
        const handleMouseLeave = () => gsapAnimations.buttonUnhover(el);
        const handleClick = () => gsapAnimations.buttonClick(el);

        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('click', handleClick);

        return () => {
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
            el.removeEventListener('click', handleClick);
        };
    }, []);

    return ref;
}
