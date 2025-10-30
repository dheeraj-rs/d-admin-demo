import { useMemo } from 'react';
import type { FloatingCubesProps } from '../../../types/bg-effects';

const FloatingCubes: React.FC<FloatingCubesProps> = ({ className }) => {
    const cubes = useMemo(
        () =>
            Array.from({ length: 8 }, (_, i) => ({
                left: (i * 11) % 90,
                top: (i * 13) % 90,
                scale: 0.5 + ((i * 0.7) % 1.2),
                delay: i * 0.7,
            })),
        []
    );

    return (
        <div className={`bg-floating-cubes ${className || ''}`}>
            {cubes.map((pos, index) => (
                <div
                    key={`cube-${index}`}
                    className="bg-cube"
                    style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        animationDelay: `${pos.delay}s`,
                        transform: `scale(${pos.scale})`,
                    }}
                >
                    <div className="bg-cube-face bg-front"></div>
                    <div className="bg-cube-face bg-back"></div>
                    <div className="bg-cube-face bg-right"></div>
                    <div className="bg-cube-face bg-left"></div>
                    <div className="bg-cube-face bg-top"></div>
                    <div className="bg-cube-face bg-bottom"></div>
                </div>
            ))}
        </div>
    );
};

FloatingCubes.displayName = 'FloatingCubes';

export default FloatingCubes;
