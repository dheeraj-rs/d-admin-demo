'use client';
import React from 'react';
import { Tag, Download, Calendar, Eye, Code, Star, Info } from 'lucide-react';
import '../styles.scss';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const TemplateDetailsPage = () => {
    const params = useParams();
    const templateId = params.id as string;
    return (
        <div className="template-details_wrapper">
            <Link href="/webconfig/portfolio" className="back_button">
                <i className="pi pi-chevron-left" />
                <span>Back</span>
            </Link>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        {/* Template Info */}
                        <div className="template-info">
                            <h1>Web Agency For Your Business</h1>
                            <p className="subtitle">Web Agency For Your Business – Modern & Responsive Website Template</p>

                            <div className="rating">
                                <div className="stars">
                                    <Star className="star-icon filled" size={20} />
                                    <Star className="star-icon filled" size={20} />
                                    <Star className="star-icon filled" size={20} />
                                    <Star className="star-icon filled" size={20} />
                                    <Star className="star-icon filled" size={20} />
                                </div>
                                <span className="rating-text">(5.0)</span>
                            </div>

                            <div className="meta-info">
                                <div className="meta-item">
                                    <Tag size={16} />
                                    <span>Latest</span>
                                </div>
                                <div className="meta-item">
                                    <Download size={16} />
                                    <span>81 downloads</span>
                                </div>
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>Added on May 12, 2025</span>
                                </div>
                            </div>

                            <div className="price">Free</div>

                            <div className="action-buttons">
                                <button className="btn btn-secondary">
                                    <Eye size={18} />
                                    Preview Live
                                </button>
                                <button className="btn btn-primary">
                                    <Code size={18} />
                                    Source Code
                                </button>
                            </div>
                        </div>
                        {/* Template Preview */}
                        <div className="template-preview">
                            <div className="preview-image">
                                <div className="browser-frame">
                                    <div className="browser-header">
                                        <div className="browser-dots">
                                            <span className="dot-red"></span>
                                            <span className="dot-yellow"></span>
                                            <span className="dot-green"></span>
                                        </div>
                                    </div>
                                    <div className="preview-content">
                                        <div className="preview-bg">
                                            {/* <img
                                                className="preview-img"
                                                src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800"
                                                alt="Template Preview"
                                            /> */}
                                            <div className="preview-video">
                                                <video className="preview-video-element" src="https://www.w3schools.com/html/mov_bbb.mp4" autoPlay loop muted />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="about-section">
                <div className="container">
                    <h2>About This Template</h2>
                    <p>
                        This latest template is perfect for developers and businesses looking to quickly launch a professional website. Built with modern
                        technologies, it offers a responsive design that works perfectly on all devices.
                    </p>
                    <p>
                        The template comes with detailed documentation to help you get started and customize it to your needs. Whether you&apos;re a beginner or
                        an experienced developer, you&apos;ll find this template easy to work with and adapt.
                    </p>
                </div>
            </div>

            {/* Key Features */}
            <div className="features-section">
                <div className="container">
                    <h2>Key Features</h2>
                    <ul className="features-list">
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Fully Responsive Design</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Modern & Clean Design</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Easy Customization</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>SEO Optimized</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Cross-Browser Compatible</span>
                        </li>
                        <li className="feature-item">
                            <span className="check-icon">✓</span>
                            <span>Well Documented</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Sponsored Content */}
            <div className="sponsored-section">
                <div className="container">
                    <p className="sponsored-label">Sponsored Content</p>
                    <div className="sponsored-ad">
                        <div className="ad-content">
                            <h3>Start building for free</h3>
                            <p>Run anywhere, scale confidently, and reduce complexity.</p>
                        </div>
                        <div className="ad-action">
                            <button className="arrow-btn">→</button>
                        </div>
                        <div className="ad-badge">Advertisement</div>
                        <div className="ad-brand">MongoDB Atlas</div>
                    </div>
                </div>
            </div>

            {/* Technical Specifications */}
            <div className="tech-section">
                <div className="container">
                    <h2>Technical Specifications</h2>

                    <div className="compatibility-section">
                        <h3>Compatibility & Integration:</h3>
                        <p>
                            The JavaScript in this template is compatible with all modern browsers and has graceful fallbacks for older browsers. It&apos;s
                            designed to be easily extensible, allowing you to add your own functionality or integrate with other libraries and frameworks.
                        </p>

                        <div className="tech-tags">
                            <span className="tech-tag">Compatible with jQuery</span>
                            <span className="tech-tag">React-ready</span>
                            <span className="tech-tag">Vue.js integration</span>
                            <span className="tech-tag">API consumption ready</span>
                            <span className="tech-tag">AJAX functionality</span>
                        </div>
                    </div>

                    <div className="best-practices">
                        <h3>
                            <span className="check-icon-green">✓</span>
                            Web Development Best Practices
                        </h3>

                        <div className="practices-grid">
                            <div className="practice-category">
                                <h4>Performance</h4>
                                <ul>
                                    <li>Optimized asset loading</li>
                                    <li>Minimized HTTP requests</li>
                                    <li>Compressed resources</li>
                                    <li>Browser caching configured</li>
                                </ul>
                            </div>

                            <div className="practice-category">
                                <h4>Accessibility</h4>
                                <ul>
                                    <li>WCAG 2.1 AA compliant</li>
                                    <li>Keyboard navigation support</li>
                                    <li>Screen reader friendly</li>
                                    <li>Color contrast optimized</li>
                                </ul>
                            </div>

                            <div className="practice-category">
                                <h4>Security</h4>
                                <ul>
                                    <li>XSS protection measures</li>
                                    <li>CSRF prevention</li>
                                    <li>Content-Security-Policy ready</li>
                                    <li>HTTPS compatibility</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="documentation-info">
                        <div className="doc-header">
                            <Info className="info-icon" size={24} />
                            <h3>Complete Documentation Included</h3>
                        </div>
                        <p>
                            This template comes with comprehensive documentation covering how to customize HTML structure, CSS styling, and JavaScript
                            functionality. Whether you&apos;re new to web development or an experienced professional, our detailed guides will help you make the
                            most of this template.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetailsPage;
