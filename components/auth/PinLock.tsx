'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, LucideIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import anime from 'animejs';
import '../../styles/pages/auth/index.scss';

interface PinLockProps {
    /**
     * API endpoint to fetch the encrypted PIN (GET request)
     * Should return: { encryptedPin: string }
     */
    getPinEndpoint: string;

    /**
     * API endpoint to verify the PIN (POST request)
     * Should accept: { pin: string, encryptedPin: string }
     * Should return: { success: boolean }
     */
    verifyPinEndpoint: string;

    /**
     * Additional payload to send with verify request
     * @example { pagePath: '/emails' }
     */
    verifyPayload?: Record<string, any>;

    /**
     * Callback function when PIN is successfully verified
     */
    onSuccess: () => void;

    /**
     * Icon to display in the PIN lock screen
     * @default Lock
     */
    icon?: LucideIcon;

    /**
     * Title text to display
     * @default "Enter PIN"
     */
    title?: string;

    /**
     * PIN length (number of digits)
     * @default 4
     */
    pinLength?: number;

    /**
     * Show toast notifications
     * @default true
     */
    showToasts?: boolean;

    /**
     * Custom success message
     * @default "Access Granted!"
     */
    successMessage?: string;

    /**
     * Custom error message for incorrect PIN
     * @default "Incorrect PIN"
     */
    errorMessage?: string;

    /**
     * Icon color
     * @default "var(--primary-color)"
     */
    iconColor?: string;

    /**
     * Icon size
     * @default 40
     */
    iconSize?: number;
}

const PinLock: React.FC<PinLockProps> = ({
    getPinEndpoint,
    verifyPinEndpoint,
    verifyPayload,
    onSuccess,
    icon: Icon,
    title = 'Enter PIN',
    pinLength = 4,
    showToasts = true,
    successMessage = 'Access Granted!',
    errorMessage = 'Incorrect PIN',
    iconColor = 'var(--primary-color)',
    iconSize = 40,
}) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [encryptedPin, setEncryptedPin] = useState<string>('');

    // Fetch encrypted PIN from API on mount
    useEffect(() => {
        const fetchEncryptedPin = async () => {
            try {
                const response = await fetch(getPinEndpoint);
                const data = await response.json();
                if (data.encryptedPin) {
                    setEncryptedPin(data.encryptedPin);
                }
            } catch (error) {
                console.error('Failed to fetch encrypted PIN:', error);
                if (showToasts) {
                    toast.error('Failed to load security token');
                }
            }
        };

        fetchEncryptedPin();
    }, [getPinEndpoint, showToasts]);

    // Handle number button clicks
    const handleNumberClick = useCallback(
        (number: string) => {
            if (pin.length < pinLength) {
                setPin((prev) => prev + number);
                setError(null);
            }
        },
        [pin, pinLength]
    );

    // Handle delete button click
    const handleDelete = useCallback(() => {
        setPin((prev) => prev.slice(0, -1));
        setError(null);
    }, []);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (showSuccess) return;

            // Handle number keys (0-9)
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                handleNumberClick(e.key);
            }
            // Handle backspace/delete
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleNumberClick, handleDelete, showSuccess]);

    // Verify PIN when complete
    useEffect(() => {
        const verifyPin = async () => {
            if (pin.length === pinLength && !isVerifying && !showSuccess) {
                setIsVerifying(true);

                try {
                    const body: any = { pin };
                    // Only include encryptedPin if it exists (for backward compatibility)
                    if (encryptedPin) {
                        body.encryptedPin = encryptedPin;
                    }
                    // Include additional payload if provided
                    if (verifyPayload) {
                        Object.assign(body, verifyPayload);
                    }

                    const response = await fetch(verifyPinEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        setShowSuccess(true);
                        setError(null);
                        if (showToasts) {
                            toast.success(successMessage, { id: 'access-granted' });
                        }

                        setTimeout(() => {
                            onSuccess();
                        }, 1100);
                    } else {
                        setError(errorMessage);
                        setPin('');
                        setIsVerifying(false);
                        if (showToasts) {
                            toast.error(errorMessage, { id: 'incorrect-pin' });
                        }

                        // Shake animation
                        const pinCard = document.querySelector('.pin-auth__card');
                        if (pinCard) {
                            anime({
                                targets: pinCard,
                                translateX: [
                                    { value: -10, duration: 100 },
                                    { value: 10, duration: 100 },
                                    { value: -10, duration: 100 },
                                    { value: 10, duration: 100 },
                                    { value: 0, duration: 100 }
                                ],
                                easing: 'easeInOutSine'
                            });
                        }
                    }
                } catch (error) {
                    console.error('PIN verification failed:', error);
                    setError('Verification failed');
                    setPin('');
                    setIsVerifying(false);
                    if (showToasts) {
                        toast.error('Verification failed', { id: 'verification-failed' });
                    }
                }
            }
        };

        verifyPin();
    }, [pin, encryptedPin, isVerifying, showSuccess, pinLength, verifyPinEndpoint, verifyPayload, onSuccess, errorMessage, successMessage, showToasts]);

    return (
        <div className="pin-auth__wrapper">
            {showToasts && <Toaster position="top-right" />}

            <div className="pin-auth__container">
                <div className="pin-auth__card">
                    <div className="pin-auth__logo">
                        <div className="pin-auth__logo-circle">
                            <div className="pin-auth__logo-icon">
                                {Icon && <Icon size={iconSize} color={iconColor} />}
                            </div>
                        </div>
                    </div>

                    <h1 className="pin-auth__title">{title}</h1>

                    <div className="pin-auth__display">
                        <div className="pin-auth__dots">
                            {[...Array(pinLength)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`pin-auth__dot ${index < pin.length ? 'pin-auth__dot--active' : ''}`}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="pin-auth__error">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="pin-auth__success">
                                <CheckCircle size={14} />
                                <span>{successMessage}</span>
                            </div>
                        )}
                    </div>

                    <div className="pin-auth__keypad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                className="pin-auth__keypad-button"
                                disabled={showSuccess}
                            >
                                {num}
                            </button>
                        ))}
                        <div key="empty" className="pin-auth__keypad-button" style={{ opacity: 0, pointerEvents: 'none' }} />
                        <button
                            key="0"
                            onClick={() => handleNumberClick('0')}
                            className="pin-auth__keypad-button"
                            disabled={showSuccess}
                        >
                            0
                        </button>
                        <button
                            key="delete"
                            onClick={handleDelete}
                            className="pin-auth__keypad-button"
                            disabled={showSuccess || pin.length === 0}
                        >
                            ⌫
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinLock;
