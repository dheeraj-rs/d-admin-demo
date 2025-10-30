import { NextRequest, NextResponse } from 'next/server';
import { getUserPreferences, saveUserPreferences, getDefaultPreferences } from '../../../../lib/preferences-service';

export async function GET(request: NextRequest) {
    try {
        // Check if owner token exists - owners get default preferences
        const ownerToken = request.cookies.get('owner_token')?.value;
        if (ownerToken) {
            return NextResponse.json({
                preferences: getDefaultPreferences(),
            });
        }

        // Read from query parameters for GET request
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || undefined;
        const sessionId = searchParams.get('sessionId') || undefined;
        const superAdminId = searchParams.get('superAdminId') || undefined;

        if (!userId && !sessionId) {
            return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 });
        }

        const preferences = await getUserPreferences(userId, sessionId, superAdminId);

        if (!preferences) {
            // Return default preferences if none found
            return NextResponse.json({
                preferences: getDefaultPreferences(),
            });
        }

        return NextResponse.json({
            preferences: {
                theme: preferences.theme,
                language: preferences.language,
                layout: preferences.layout,
                websiteBuilder: preferences.websiteBuilder,
                dashboard: preferences.dashboard,
                notifications: preferences.notifications,
                privacy: preferences.privacy,
            },
        });
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionId, superAdminId, preferences } = await request.json();

        if (!userId && !sessionId) {
            return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 });
        }

        if (!preferences) {
            return NextResponse.json({ error: 'Preferences data required' }, { status: 400 });
        }

        const savedPreferences = await saveUserPreferences(preferences, userId, sessionId, superAdminId);

        if (!savedPreferences) {
            return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
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
        console.error('Error saving user preferences:', error);
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }
}
