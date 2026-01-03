import gsap from 'gsap';

export const gsapAnimations = {
    // Dialog / Modal animations
    dialogIn: (overlay: HTMLElement, content: HTMLElement) => {
        const tl = gsap.timeline();
        tl.fromTo(overlay,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        tl.fromTo(content,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
            '-=0.2'
        );
        return tl;
    },
    dialogOut: (overlay: HTMLElement, content: HTMLElement, onComplete: () => void) => {
        const tl = gsap.timeline({ onComplete });
        tl.to(content, { opacity: 0, scale: 0.95, y: 10, duration: 0.2, ease: 'power2.in' });
        tl.to(overlay, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
        return tl;
    },

    // Side Panel animations
    panelIn: (backdrop: HTMLElement, panel: HTMLElement) => {
        const tl = gsap.timeline();
        tl.fromTo(backdrop,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        tl.fromTo(panel,
            { x: '100%' },
            { x: '0%', duration: 0.5, ease: 'power3.out' },
            '-=0.2'
        );
        return tl;
    },
    panelOut: (backdrop: HTMLElement, panel: HTMLElement, onComplete: () => void) => {
        const tl = gsap.timeline({ onComplete });
        tl.to(panel, { x: '100%', duration: 0.4, ease: 'power3.in' });
        tl.to(backdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '-=0.2');
        return tl;
    },

    // Dropdown / Menu animations
    menuIn: (menu: HTMLElement) => {
        return gsap.fromTo(menu,
            { opacity: 0, scale: 0.95, transformOrigin: 'top right', y: -10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }
        );
    },
    menuOut: (menu: HTMLElement, onComplete?: () => void) => {
        return gsap.to(menu, {
            opacity: 0,
            scale: 0.95,
            y: -5,
            duration: 0.15,
            ease: 'power2.in',
            onComplete
        });
    },

    // Button animations
    buttonHover: (button: HTMLElement) => {
        gsap.to(button, {
            scale: 1.02,
            duration: 0.2,
            ease: "power2.out"
        });
    },
    buttonUnhover: (button: HTMLElement) => {
        gsap.to(button, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
        });
    },
    buttonClick: (button: HTMLElement) => {
        const tl = gsap.timeline();
        tl.to(button, { scale: 0.95, duration: 0.1 })
            .to(button, { scale: 1, duration: 0.1 });
    }
};
