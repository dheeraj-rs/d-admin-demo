'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'var(--surface-ground)',
                    color: 'var(--text-color)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'var(--surface-card)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        maxWidth: '400px'
                    }}>
                        <h1 style={{ marginBottom: '1rem', color: 'var(--red-500)' }}>
                            Something went wrong
                        </h1>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-color-secondary)' }}>
                            Please refresh the page or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'var(--primary-color)',
                                color: 'var(--primary-color-text)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 