import { useMemo } from 'react';

const FloatingTechElements = () => {
    const elements = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => ({
                left: (i * 13) % 90,
                top: (i * 17) % 90,
                duration: 15 + ((i * 3) % 20),
                delay: i * 0.5,
            })),
        []
    );

    return (
        <div className="bg-floating-elements">
            {['<div>', '</>', '{code}', '<style>', 'export', 'import', 'return'].map((text, index) => (
                <div
                    key={`element-${index}`}
                    className="bg-floating-element"
                    style={{
                        left: `${elements[index].left}%`,
                        top: `${elements[index].top}%`,
                        animationDuration: `${elements[index].duration}s`,
                        animationDelay: `${elements[index].delay}s`,
                    }}
                >
                    {text}
                </div>
            ))}
        </div>
    );
};

export default FloatingTechElements;
