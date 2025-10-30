'use client';

import { useState, useEffect, useContext } from 'react';
import {
    Mail,
    Github,
    Linkedin,
    ExternalLink,
    ChevronDown,
    Calendar,
    MapPin,
    Briefcase,
    Code2,
    Palette,
    GitBranch,
    ArrowRight,
    ArrowUp,
    Menu,
    X,
} from 'lucide-react';
import '../../styles/pages/portfolio/index.scss';
import ScrollIndicator from '../scroll-indicator/ScrollIndicator';
import Link from 'next/link';
import GalaxyBackground from '../ui/bg-effects/GalaxyBackground';
import Image from 'next/image';
import { LayoutContext } from '../../layout/context/LayoutContext';
import { useRouter } from 'next/navigation';
import Loader from '../sample/loading/loader';

interface PortfolioClientProps {
    initialData?: any;
}

const stats = [
    { label: 'Years Experience', value: '3+' },
    { label: 'Projects Completed', value: '126+' },
    { label: 'Technologies', value: '20+' },
    { label: 'Happy Clients', value: '30+' },
];

const projects = [
    {
        title: 'Software Building Platform',
        description:
            'Full-stack software building platform with React, Node.js, and MongoDB. Features include user authentication, payment integration, and admin dashboard.',
        tech: ['React', 'Node.js', 'MongoDB'],
        image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
        github: 'https://github.com/dheeraj-rs/d-admin.git',
        live: 'https://www.dheerajrs.com',
        technologies: ['Next.js', 'React', 'Node.js', 'MongoDB', 'SCSS'],
        links: {
            github: 'https://github.com/dheeraj-rs/d-admin.git',
            live: 'https://www.dheerajrs.com/dashboard',
        },
        featured: true,
    },
];

export default function PortfolioClient({ initialData }: PortfolioClientProps) {
    const { layoutConfig } = useContext(LayoutContext);
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => {
            const sections = ['home', 'about', 'skills', 'projects', 'contact'];
            const scrollPosition = window.scrollY + 100;
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const featuredProjects = projects.filter((project) => project.featured);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return loading ? (
        <Loader finishLoading={() => setLoading(false)} />
    ) : (
        <div className="portfolio-container">
            <GalaxyBackground />
            <ScrollIndicator />
            <nav className={`navbar ${activeSection !== 'home' ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="nav-container">
                    <Image
                        src={`/layout/logo-${layoutConfig?.colorScheme === 'dark' ? 'dark' : 'white'}.svg`}
                        width={40}
                        height={40}
                        alt="logo"
                        className="nav-logo"
                    />
                    <ul className="nav-menu">
                        {['home', 'about', 'skills', 'projects', 'contact'].map((item) => (
                            <li key={item} className="nav-item">
                                <a
                                    href={`#${item}`}
                                    className={`nav-link ${activeSection === item ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(item);
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && <div className="mobile-backdrop" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-container">
                    <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
                        <div className="hero-main">
                            <div className="hero-text-container">
                                <div className="hero-text">
                                    <div className="greeting">
                                        <span className="wave">👋</span>
                                        <span>Hello, I&apos;m</span>
                                    </div>

                                    <h1 className="hero-title">
                                        <span className="name-highlight">DHEERAJ R S</span>
                                        <span className="title-accent">Full Stack Developer</span>
                                    </h1>

                                    <p className="hero-description">
                                        Passionate Full Stack Developer specializing in MERN stack, React, Next.js, and Astro. Creating exceptional digital
                                        experiences with clean code and innovative solutions.
                                    </p>

                                    <div className="location">
                                        <MapPin size={16} />
                                        <span>Cyberpark Calicut, Kerala</span>
                                    </div>

                                    <div className="hero-actions">
                                        <Link href="/" className="cta-primary">
                                            <span>View My Work</span>
                                        </Link>
                                        <button className="cta-secondary" onClick={() => scrollToSection('contact')}>
                                            <Mail size={16} />
                                            <span>Get In Touch</span>
                                        </button>
                                    </div>

                                    <div className="social-links">
                                        <a href="https://github.com/dheeraj-rs" className="social-link" aria-label="GitHub">
                                            <Github size={20} />
                                        </a>
                                        <a href="https://www.linkedin.com/in/dheeraj-rs/" className="social-link" aria-label="LinkedIn">
                                            <Linkedin size={20} />
                                        </a>
                                        <a href="mailto:drjsde@gmail.com" className="social-link" aria-label="Email">
                                            <Mail size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-stats-container">
                                <div className="hero-stats">
                                    {stats.map((stat, index) => (
                                        <div key={stat.label} className="stat-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="stat-value">{stat.value}</div>
                                            <div className="stat-label">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll-indicator" onClick={() => scrollToSection('about')}>
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">About Me</h2>
                        <p className="section-subtitle">Passionate about creating innovative solutions</p>
                    </div>
                    <div className="about-content">
                        <div className="about-text">
                            <div className="about-description">
                                <p className="description">
                                    I&apos;m a passionate Full Stack Developer with over 3 years of experience in building scalable web applications and mobile
                                    solutions. Currently working at Cyberpark Calicut, I specialize in the MERN stack and modern frameworks like Next.js and
                                    Astro.
                                </p>
                                <div className="about-highlights">
                                    <div className="highlight-item">
                                        <MapPin size={20} />
                                        <span>Cyberpark Calicut, Kerala</span>
                                    </div>
                                    <div className="highlight-item">
                                        <Briefcase size={20} />
                                        <span>Full Stack Developer</span>
                                    </div>
                                    <div className="highlight-item">
                                        <Calendar size={20} />
                                        <span>3+ Years Experience</span>
                                    </div>
                                </div>
                            </div>
                            <div className="philosophy">
                                <h3>My Philosophy</h3>
                                <blockquote>
                                    &ldquo;Great software is not just about code&mdash;it&apos;s about understanding user needs, solving real problems, and
                                    creating experiences that make a difference.&rdquo;
                                </blockquote>
                            </div>
                        </div>
                        <div className="about-image">
                            <div className="image-container">
                                <div className="profile-image">
                                    <img src="/img/portfolio/drj.jpeg" alt="Dheeraj R S" />
                                </div>
                                <div className="image-overlay"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="skills-section backdrop-blur">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Technical Skills</h2>
                        <p className="section-subtitle">Technologies I work with</p>
                    </div>
                    <div className="skills-summary">
                        <div className="summary-card">
                            <div className="summary-icon">
                                <Code2 size={32} />
                            </div>
                            <div className="summary-content">
                                <h3>Full Stack Expertise</h3>
                                <p>
                                    Comprehensive experience in both frontend and backend development, with a focus on modern JavaScript ecosystem and scalable
                                    architecture.
                                </p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon">
                                <Palette size={32} />
                            </div>
                            <div className="summary-content">
                                <h3>UI/UX Focused</h3>
                                <p>
                                    Strong attention to design details and user experience, creating interfaces that are both beautiful and highly functional.
                                </p>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="summary-icon">
                                <GitBranch size={32} />
                            </div>
                            <div className="summary-content">
                                <h3>Best Practices</h3>
                                <p>Following industry standards for code quality, version control, testing, and deployment workflows.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="projects-section backdrop-blur">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Projects</h2>
                        <p className="section-subtitle">Some of my recent work</p>
                    </div>
                    <div className="featured-projects">
                        {featuredProjects.map((project, index) => (
                            <div key={project.title} className="featured-project" style={{ animationDelay: `${index * 0.2}s` }}>
                                <div className="project-image">
                                    <img src={project.image} alt={project.title} />
                                    <div className="project-overlay">
                                        <div className="project-links">
                                            <a href={project.links.github} className="project-link" aria-label="View code">
                                                <Github size={20} />
                                            </a>
                                            <a href={project.links.live} className="project-link" aria-label="View live site">
                                                <ExternalLink size={20} />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-description">{project.description}</p>

                                    <div className="project-technologies">
                                        {project.technologies.map((tech) => (
                                            <span key={tech} className="tech-tag">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="project-actions">
                                        <a href={project.links.live} className="view-project">
                                            View Project
                                            <ArrowRight size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section backdrop-blur">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Let&apos;s Work Together</h2>
                        <p className="section-subtitle">Ready to bring your ideas to life</p>
                    </div>
                    <div className="contact-content">
                        <div className="contact-info">
                            <h3>Get In Touch</h3>
                            <p>
                                I&apos;m always interested in new opportunities and exciting projects. Whether you have a question or just want to say hi, feel
                                free to reach out!
                            </p>
                            <div className="contact-links">
                                <a href="mailto:drjsde@gmail.com" className="contact-link">
                                    <Mail size={20} />
                                    <span>drjsde@gmail.com</span>
                                </a>
                                <a href="https://github.com/dheeraj-rs/d-admin.git" className="contact-link">
                                    <Github size={20} />
                                    <span>github.com/dheeraj-rs</span>
                                </a>
                                <a href="https://www.linkedin.com/in/dheeraj-rs/" className="contact-link">
                                    <Linkedin size={20} />
                                    <span>linkedin.com/in/dheeraj-rs</span>
                                </a>
                            </div>
                        </div>
                        <div className="contact-form">
                            <form>
                                <div className="form-group">
                                    <input type="text" placeholder="Your Name" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Your Email" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Your Message" rows={5} className="form-textarea"></textarea>
                                </div>
                                <button type="submit" className="submit-btn full-width">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2024 Dheeraj R S. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#" className="footer-link">
                            Privacy
                        </a>
                        <a href="#" className="footer-link">
                            Terms
                        </a>
                    </div>
                </div>
                <button onClick={scrollToTop} className="scroll-to-top" aria-label="Scroll to top">
                    <ArrowUp size={20} />
                </button>
            </footer>
        </div>
    );
} 