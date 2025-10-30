'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import authFetch from '../lib/auth-fetch';
import { safeJsonParse } from '../lib/safe-fetch';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface GmailAccount {
    _id?: string;
    email: string;
    password: string;
    name: string;
    category: 'personal' | 'gaming' | 'backup' | 'testing' | 'professional' | 'pro-mails';
    notes: INoteItem[];
}

export const useEmailAccounts = () => {
    const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGmailAccounts = async () => {
        try {
            setIsLoading(true);
            const response = await authFetch('/api/gmail-accounts');
            const data = await safeJsonParse(response);

            if (data.success && data.data) {
                setGmailAccounts(data.data);
            } else {
                console.error('API response error:', data);
                toast.error(data.error || 'Failed to load accounts');
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Failed to load accounts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGmailAccounts();
    }, []);

    return { gmailAccounts, isLoading, refetch: fetchGmailAccounts };
};
