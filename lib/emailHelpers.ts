import toast from 'react-hot-toast';

export const copyToClipboard = async (
    text: string,
    type: 'email' | 'password',
    id: string | undefined,
    userRole: string,
    setCopiedEmail: (id: string | null) => void,
    setCopiedPassword: (id: string | null) => void,
    setCopyingPassword: (id: string | null) => void,
    copyingPassword: string | null
) => {
    if (!id) return;

    if (type === 'password' && copyingPassword === id) return;

    try {
        if (type === 'email') {
            await navigator.clipboard.writeText(text);
            setCopiedEmail(id);
            toast.success('Email copied!');
            setTimeout(() => setCopiedEmail(null), 2000);
        } else {
            if (userRole !== 'superadmin') {
                toast.error('Super Admin access required to copy passwords');
                return;
            }

            setCopyingPassword(id);

            const response = await fetch('/api/gmail-accounts/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: id })
            });
            const data = await response.json();

            if (data.success && data.password) {
                await navigator.clipboard.writeText(data.password);
                setCopiedPassword(id);
                toast.success('Password copied!');
                setTimeout(() => setCopiedPassword(null), 2000);
            } else {
                toast.error(data.error || 'Failed to copy password');
            }

            setCopyingPassword(null);
        }
    } catch (error) {
        console.error('Copy error:', error);
        toast.error('Failed to copy');
        setCopyingPassword(null);
    }
};

export const handleEmailClick = (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials).then(() => {
        toast.success('Email & Password copied! Opening Google login...');
    });

    const googleLoginUrl = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(email)}&continue=https://mail.google.com`;
    window.open(googleLoginUrl, '_blank', 'noopener,noreferrer');
};
