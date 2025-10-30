import React, { useEffect, useRef } from 'react';

interface NoMatchingDataProps {
  message?: string;
  suggestion?: string;
  onReset?: () => void;
  searchQuery?: string;
}

const NoMatchingData: React.FC<NoMatchingDataProps> = ({
  message = 'No matching website found',
  suggestion = 'Try different keywords or browse all templates',
  onReset,
  searchQuery = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    const scanner = scannerRef.current;

    if (container) {
      container.classList.add('animate-in');
    }
    if (scanner) {
      const timer = setTimeout(() => {
        scanner.classList.add('pulse-active');
      }, 300);
    }

    return () => {
      if (container) {
        container.classList.remove('animate-in');
      }
      if (scanner) {
        scanner.classList.remove('pulse-active');
      }
    };
  }, []);

  // Define floating elements with fixed positions
  const floatingElements = [
    { left: '10.92%', top: '52.74%', delay: '2.80s', duration: '5.10s' },
    { left: '75.76%', top: '54.75%', delay: '4.66s', duration: '7.64s' },
    { left: '9.46%', top: '61.59%', delay: '0.50s', duration: '10.23s' },
    { left: '68.89%', top: '89.66%', delay: '2.58s', duration: '5.04s' },
    { left: '0.85%', top: '76.44%', delay: '1.38s', duration: '11.23s' },
    { left: '8.14%', top: '6.76%', delay: '2.68s', duration: '9.19s' },
    { left: '26.43%', top: '14.65%', delay: '2.27s', duration: '6.61s' },
    { left: '30.38%', top: '52.93%', delay: '3.98s', duration: '9.11s' },
    { left: '84.23%', top: '31.78%', delay: '4.13s', duration: '10.73s' },
    { left: '45.41%', top: '56.14%', delay: '0.72s', duration: '5.26s' },
    { left: '14.12%', top: '82.64%', delay: '2.32s', duration: '10.81s' },
    { left: '31.02%', top: '43.39%', delay: '4.15s', duration: '7.66s' },
    { left: '22.45%', top: '96.14%', delay: '1.77s', duration: '14.27s' },
    { left: '67.20%', top: '28.33%', delay: '1.87s', duration: '8.04s' },
    { left: '85.96%', top: '93.63%', delay: '1.09s', duration: '5.63s' }
  ];

  return (
    <div className="no-matching-data__wrapper" ref={containerRef}>
      <div className="no-match-content">
        <div className="scanner-animation" ref={scannerRef}>
          <div className="scanner-circle"></div>
          <div className="scanner-beam"></div>
          <div className="scanner-lines">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="scanner-line"
                style={{ transform: `rotate(${index * 45}deg)` }}
              ></div>
            ))}
          </div>
        </div>
        <div className="no-match-details">
          <h2 className="no-match-title">{message}</h2>
          {searchQuery && (
            <div className="search-term">
              <span className="search-label">Search:</span>
              <span className="search-value">{searchQuery}</span>
            </div>
          )}
          <p className="no-match-suggestion">{suggestion}</p>
          {onReset && (
            <button className="reset-btn" onClick={onReset}>
              <span className="btn-text">Reset Filters</span>
              <span className="btn-icon">
                <i className="pi pi-refresh" />
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="tech-background">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="grid-line"></div>
        ))}
        {floatingElements.map((elem, i) => (
          <div
            key={i}
            className="floating-element"
            style={{
              left: elem.left,
              top: elem.top,
              animationDelay: elem.delay,
              animationDuration: elem.duration,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default NoMatchingData;