import type { FC } from 'react';
import { memo } from 'react';
import FloatingCubes from '../components/ui/bg-effects/FloatingCubes';
import GridBackground from '../components/ui/bg-effects/GalaxyBackground';
import FloatingTechElements from '../components/ui/bg-effects/FloatingTechElements';
import TextGlitchEffects from '../components/ui/text-effects/TextGlitchEffects';
import GlowButton from '../components/ui/Button/GlowButton';
import GlowButtonTransparent from '../components/ui/Button/GlowButtonTransparent';

const NotFoundPage: FC = () => {
    return (
        <div className="nfp__container">
            <div className="nfp-not-found-content">
                <div className="nfp-static-layers">
                    <div className="nfp-layer nfp-layer-1">
                        <div className="nfp-error-code-3d">
                            <span className="nfp-front">404</span>
                            <span className="nfp-shadow">404</span>
                        </div>
                    </div>

                    <div className="nfp-layer nfp-layer-2">
                        <TextGlitchEffects text="Page Not Found" />
                    </div>

                    <div className="nfp-layer nfp-layer-3">
                        <p className="nfp-error-message">
                            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                        </p>
                    </div>
                </div>

                <div className="nfp-website-details">
                    <div className="nfp-website-details-icon">
                        <div className="nfp-circle-pulse"></div>
                        <div className="nfp-server-icon"></div>
                    </div>
                    <div className="nfp-website-details-text">
                        <p className="nfp-highlight">Website Management Platform</p>
                        <p>Manage 1000+ websites with our comprehensive control panel</p>
                        <p>Access 10,000+ code snippets with customizable styles</p>
                    </div>
                </div>

                <div className="nfp-action-buttons">
                    <GlowButton text="Return to Dashboard" href="/" />
                    <GlowButtonTransparent
                        text="Browse Websites"
                        href="#"
                        onClick={() => {
                            window.location.reload();
                        }}
                    />
                </div>

                <div className="nfp-animated-code-editor">
                    <div className="nfp-code-editor-header">
                        <span className="nfp-code-editor-dot nfp-red"></span>
                        <span className="nfp-code-editor-dot nfp-yellow"></span>
                        <span className="nfp-code-editor-dot nfp-green"></span>
                        <span className="nfp-code-editor-title">404.tsx</span>
                    </div>
                    <div className="nfp-code-editor-content">
                        <div className="nfp-code-line">
                            <span className="nfp-line-number">1</span>
                            <span className="nfp-code-keyword">import</span>{' '}
                            <span className="nfp-code-text">
                                {'\u00A0'}React{'\u00A0'}
                            </span>{' '}
                            <span className="nfp-code-keyword">from{'\u00A0'}</span> <span className="nfp-code-string">&apos;react&apos;</span>;
                        </div>
                        <div className="nfp-code-line">
                            <span className="nfp-line-number">2</span>
                            <span className="nfp-code-keyword">function{'\u00A0'}</span> <span className="nfp-code-function">NotFound</span>() {`{`}
                        </div>
                        <div className="nfp-code-line nfp-typing">
                            <span className="nfp-line-number">3</span> <span className="nfp-code-keyword-return">return{'\u00A0'}</span>{' '}
                            <span className="nfp-code-text">goToHomePage()</span>;
                        </div>
                        <div className="nfp-code-line">
                            <span className="nfp-line-number">4</span>
                            {`}`}
                        </div>
                    </div>
                </div>
            </div>
            <FloatingCubes />
            <GridBackground />
            <FloatingTechElements />
        </div>
    );
};

export default memo(NotFoundPage);