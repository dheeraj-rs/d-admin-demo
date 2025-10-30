"use client"

import React, { useEffect, useState } from 'react';
import { Code, Terminal, Layers, Rocket, Settings, Zap, Play, Notebook, Download } from 'lucide-react';
import './welcome.scss';
import AnimatedBackground from './animated-background';
import Loader from './loader';

const WelcomeScreen: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [selectedComponent, setSelectedComponent] = useState(0);
    // const [animationComplete, setAnimationComplete] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        // In case if video failed to start/load
        const timeout = setTimeout(() => {
            if (isVideoLoaded === false) {
                setIsVideoLoaded(true);
            }
        }, 3000);
        return () => clearTimeout(timeout);
    }, [isVideoLoaded]);

    const features = [
        {
            title: 'Snippet Tools',
            icon: <Code />,
            description: 'Save and reuse code snippets with intelligent suggestions',
        },
        {
            title: 'Terminal Access',
            icon: <Terminal />,
            description: 'Built-in terminal for seamless development workflow',
        },
        {
            title: 'Component Library',
            icon: <Layers />,
            description: 'Drag and drop components to build interfaces rapidly',
        },
        {
            title: 'Quick Publishing',
            icon: <Rocket />,
            description: 'Deploy your applications with a single click',
        },
    ];

    const actions = [
        {
            title: 'Customize',
            icon: <Settings />,
            description: 'Personalize your environment',
        },
        {
            title: 'Accelerate',
            icon: <Zap />,
            description: 'Boost your development speed',
        },
        {
            title: 'Create',
            icon: <Play />,
            description: 'Start a new project',
        },
    ];

    // useEffect(() => {
    //     // Simulate loading
    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, 2000);

    //     // Rotate through components
    //     const componentInterval = setInterval(() => {
    //         setSelectedComponent((prev) => (prev + 1) % features.length);
    //     }, 3000);

    //     // Animation complete
    //     const animationTimer = setTimeout(() => {
    //         setAnimationComplete(true);
    //     }, 500);

    //     return () => {
    //         clearTimeout(timer);
    //         clearInterval(componentInterval);
    //         clearTimeout(animationTimer);
    //     };
    // }, []);

    return loading ? (
        <Loader finishLoading={() => setLoading(false)} />
    ) : (
        <>
            <AnimatedBackground onStart={() => setLoading(false)} />
            {isVideoLoaded && (
                <div className="welcome-container">
                    <div className="welcome-content">
                        <div className="welcome-header">
                            <h1>Welcome to DevForge</h1>
                            <p className="tagline">Modern development environment with advanced tooling</p>
                        </div>

                        <div className="welcome-body">
                            <div className="left-panel">
                                <div className="intro-text">
                                    <h2>Accelerate Your Development Workflow</h2>
                                    <p>
                                        DevForge provides a comprehensive suite of tools designed to streamline your development process. Build, test, and
                                        deploy with ease—no coding required for setup.
                                    </p>

                                    <div className="action-buttons">
                                        <button className="primary-button">
                                            <Play size={20} />
                                            Get Started
                                        </button>
                                        <button className="secondary-button">
                                            <Notebook size={20} />
                                            View Documentation
                                        </button>
                                    </div>
                                </div>

                                <div className="feature-cards">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className={`feature-card ${selectedComponent === index ? 'selected' : ''}`}
                                            onClick={() => setSelectedComponent(index)}
                                        >
                                            <div className="feature-icon">{feature.icon}</div>
                                            <h3>{feature.title}</h3>
                                            <p>{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="right-panel">
                                <div className="preview-container">
                                    <div className="preview-header">
                                        <div className="window-controls">
                                            <span className="control close"></span>
                                            <span className="control minimize"></span>
                                            <span className="control maximize"></span>
                                        </div>
                                        <div className="preview-title">Feature Preview</div>
                                    </div>
                                    <div className="preview-content">
                                        <div className="animation-container">
                                            <div className={`feature-preview feature-${selectedComponent}`}>
                                                <div className="preview-icon">{features[selectedComponent].icon}</div>
                                                <h2>{features[selectedComponent].title}</h2>
                                                <div className="preview-animation"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-cards">
                                    {actions.map((action, index) => (
                                        <div key={index} className="action-card">
                                            <div className="action-icon">{action.icon}</div>
                                            <h3>{action.title}</h3>
                                            <p>{action.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="welcome-footer">
                            <div className="quick-actions">
                                <button className="tool-button">
                                    <Download size={16} />
                                    Install Extensions
                                </button>
                                <button className="tool-button">
                                    <Settings size={16} />
                                    Preferences
                                </button>
                            </div>
                            <p className="version-info">Version 2.5.0</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WelcomeScreen;
