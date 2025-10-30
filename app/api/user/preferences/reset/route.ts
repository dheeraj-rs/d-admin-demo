import { NextRequest, NextResponse } from 'next/server';
import { saveUserPreferences, getDefaultPreferences } from '../../../../../lib/preferences-service';

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionId, superAdminId } = await request.json();

        if (!userId && !sessionId) {
            return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 });
        }

        const defaultPreferences = getDefaultPreferences();
        const savedPreferences = await saveUserPreferences(defaultPreferences, userId, sessionId, superAdminId);

        if (!savedPreferences) {
            return NextResponse.json({ error: 'Failed to reset preferences' }, { status: 500 });
        }

        return NextResponse.json({
            preferences: {
                theme: savedPreferences.theme,
                language: savedPreferences.language,
                layout: savedPreferences.layout,
                websiteBuilder: savedPreferences.websiteBuilder,
                dashboard: savedPreferences.dashboard,
                notifications: savedPreferences.notifications,
                privacy: savedPreferences.privacy,
            },
        });
    } catch (error) {
        console.error('Error resetting user preferences:', error);
        return NextResponse.json({ error: 'Failed to reset preferences' }, { status: 500 });
    }
}
