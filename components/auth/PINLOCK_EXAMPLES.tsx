/**
 * PinLock Component - Usage Examples
 * 
 * This file contains various examples of how to use the PinLock component
 * in different scenarios. Copy and adapt these examples for your use case.
 */

import React, { useState } from 'react';
import PinLock from './PinLock';
import { Mail, Shield, Settings, FileText, Lock, Key, Database, CreditCard } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: Basic Email Protection (Current Implementation)
// ============================================================================
export const EmailsPageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/emails/get-pin"
                verifyPinEndpoint="/api/emails/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Mail}
                title="Enter Email PIN"
                pinLength={4}
                showToasts={true}
                successMessage="Access Granted!"
                errorMessage="Incorrect PIN"
                iconColor="var(--primary-color)"
                iconSize={40}
            />
        );
    }

    return <div>Your protected email content here...</div>;
};

// ============================================================================
// EXAMPLE 2: Admin Panel with 6-digit PIN
// ============================================================================
export const AdminPanelExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/admin/get-pin"
                verifyPinEndpoint="/api/admin/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Shield}
                title="Admin Access"
                pinLength={6}
                iconColor="#ff6b6b"
                iconSize={48}
                successMessage="Welcome Admin!"
                errorMessage="Invalid Admin PIN"
            />
        );
    }

    return <div>Admin panel content...</div>;
};

// ============================================================================
// EXAMPLE 3: Settings Page Protection
// ============================================================================
export const SettingsPageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/settings/get-pin"
                verifyPinEndpoint="/api/settings/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Settings}
                title="Verify Identity"
                pinLength={4}
                showToasts={false} // No toasts for this page
                iconColor="var(--blue-500)"
            />
        );
    }

    return <div>Settings content...</div>;
};

// ============================================================================
// EXAMPLE 4: Documents/Files Protection
// ============================================================================
export const DocumentsPageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/documents/get-pin"
                verifyPinEndpoint="/api/documents/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={FileText}
                title="Secure Documents"
                pinLength={4}
                iconColor="var(--green-500)"
                iconSize={48}
                successMessage="Documents Unlocked!"
            />
        );
    }

    return <div>Documents content...</div>;
};

// ============================================================================
// EXAMPLE 5: API Keys Management
// ============================================================================
export const ApiKeysPageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/api-keys/get-pin"
                verifyPinEndpoint="/api/api-keys/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Key}
                title="API Keys Access"
                pinLength={4}
                iconColor="var(--yellow-500)"
                successMessage="Keys Unlocked!"
                errorMessage="Access Denied"
            />
        );
    }

    return <div>API keys management...</div>;
};

// ============================================================================
// EXAMPLE 6: Database Management
// ============================================================================
export const DatabasePageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/database/get-pin"
                verifyPinEndpoint="/api/database/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Database}
                title="Database Access"
                pinLength={6}
                iconColor="var(--purple-500)"
                iconSize={44}
                successMessage="Database Connected!"
            />
        );
    }

    return <div>Database management...</div>;
};

// ============================================================================
// EXAMPLE 7: Payment/Billing Protection
// ============================================================================
export const BillingPageExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/billing/get-pin"
                verifyPinEndpoint="/api/billing/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={CreditCard}
                title="Billing & Payments"
                pinLength={4}
                iconColor="var(--indigo-500)"
                successMessage="Billing Access Granted!"
            />
        );
    }

    return <div>Billing content...</div>;
};

// ============================================================================
// EXAMPLE 8: Generic Lock with Custom Callback
// ============================================================================
export const CustomCallbackExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleSuccess = () => {
        // Custom logic before granting access
        console.log('PIN verified successfully!');

        // Log access attempt
        fetch('/api/audit/log', {
            method: 'POST',
            body: JSON.stringify({
                action: 'pin_verified',
                timestamp: new Date().toISOString()
            })
        });

        // Grant access
        setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/custom/get-pin"
                verifyPinEndpoint="/api/custom/verify-pin"
                onSuccess={handleSuccess}
                icon={Lock}
                title="Secure Area"
                pinLength={4}
            />
        );
    }

    return <div>Protected content...</div>;
};

// ============================================================================
// EXAMPLE 9: Minimal Configuration
// ============================================================================
export const MinimalExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/my-page/get-pin"
                verifyPinEndpoint="/api/my-page/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
            />
        );
    }

    return <div>Content...</div>;
};

// ============================================================================
// EXAMPLE 10: Full Customization
// ============================================================================
export const FullCustomizationExample = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/custom/get-pin"
                verifyPinEndpoint="/api/custom/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Shield}
                title="Maximum Security Zone"
                pinLength={8}
                showToasts={true}
                successMessage="🎉 Access Granted! Welcome!"
                errorMessage="❌ Invalid PIN. Please try again."
                iconColor="#00ff88"
                iconSize={56}
            />
        );
    }

    return <div>Highly protected content...</div>;
};

// ============================================================================
// USAGE IN A REAL PAGE COMPONENT
// ============================================================================

/**
 * Example: How to use PinLock in your actual page
 *
 * File: app/(main)/my-protected-page/page.tsx
 */

/*
'use client';

import React, { useState } from 'react';
import PinLock from './PinLock';
import { Lock } from 'lucide-react';

const MyProtectedPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Show PIN lock if not authenticated
    if (!isAuthenticated) {
        return (
            <PinLock
                getPinEndpoint="/api/my-protected-page/get-pin"
                verifyPinEndpoint="/api/my-protected-page/verify-pin"
                onSuccess={() => setIsAuthenticated(true)}
                icon={Lock}
                title="Enter Access PIN"
                pinLength={4}
            />
        );
    }

    // Show protected content after authentication
    return (
        <div className="children__wrapper">
            <h1>Protected Content</h1>
            <p>This content is only visible after PIN verification.</p>
        </div>
    );
};

export default MyProtectedPage;
*/

// ============================================================================
// API ENDPOINT TEMPLATES
// ============================================================================

/**
 * GET PIN Endpoint Template
 * 
 * File: app/api/my-protected-page/get-pin/route.ts
 */

/*
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
    const PIN = process.env.MY_PAGE_PIN || '1234';
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    const encryptedPin = jwt.sign({ pin: PIN }, JWT_SECRET, {
        expiresIn: '1h'
    });
    
    return NextResponse.json({ encryptedPin });
}
*/

/**
 * VERIFY PIN Endpoint Template
 * 
 * File: app/api/my-protected-page/verify-pin/route.ts
 */

/*
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { pin, encryptedPin } = await request.json();
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        
        const decoded = jwt.verify(encryptedPin, JWT_SECRET) as { pin: string };
        
        if (decoded.pin === pin) {
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ success: false }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 401 });
    }
}
*/

/**
 * Environment Variables (.env)
 */

/*
MY_PAGE_PIN=1234
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
*/
