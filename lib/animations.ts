import anime from 'animejs';

export const introLogoAnimate = (onFinish: () => void) => {
    const loader = anime.timeline({
        complete: () => {
            // Ensure the callback is called after animation completes
            setTimeout(() => {
                onFinish();
            }, 100);
        },
    });
    loader
        .add({
            targets: '#logo',
            scale: {
                value: 3,
                duration: 1400,
                easing: 'easeInOutQuad',
            },
        })
        .add({
            targets: '#logo',
            scale: {
                value: 0,
                opacity: 0,
                duration: 400,
                easing: 'easeInOutQuart',
            },
        });
};
