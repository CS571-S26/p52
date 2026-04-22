const GOOGLE_AUTH_KEY = 'googleCalendarAuth';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

let googleScriptPromise;

const loadGoogleIdentityScript = () => {
    if (window.google?.accounts?.oauth2) {
        return Promise.resolve();
    }

    if (!googleScriptPromise) {
        googleScriptPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-google-identity="true"]');
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity script')));
                return;
            }

            const script = document.createElement('script');
            script.src = GOOGLE_IDENTITY_SCRIPT;
            script.async = true;
            script.defer = true;
            script.dataset.googleIdentity = 'true';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Identity script'));
            document.head.appendChild(script);
        });
    }

    return googleScriptPromise;
};

const isTokenValid = (expiresOnIso) => {
    if (!expiresOnIso) {
        return false;
    }

    const expiresAt = new Date(expiresOnIso).getTime();
    if (Number.isNaN(expiresAt)) {
        return false;
    }

    return expiresAt - Date.now() > 60_000;
};

const storeGoogleAuth = (tokenResponse) => {
    const expiresInSeconds = Number(tokenResponse?.expires_in || 0);
    const expiresOn =
        expiresInSeconds > 0
            ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
            : null;

    const payload = {
        accessToken: tokenResponse.access_token,
        expiresOn,
        scope: tokenResponse.scope || '',
        tokenType: tokenResponse.token_type || 'Bearer',
    };

    window.localStorage.setItem(GOOGLE_AUTH_KEY, JSON.stringify(payload));
    return payload;
};

const requestAccessToken = async (config, promptMode) => {
    const clientId = (config?.clientId || '').trim();
    if (!clientId) {
        throw new Error('Missing Google OAuth client ID in Settings');
    }

    await loadGoogleIdentityScript();

    return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: GOOGLE_SCOPES,
            prompt: promptMode,
            callback: (response) => {
                if (response?.error) {
                    reject(new Error(response.error));
                    return;
                }
                resolve(response);
            },
            error_callback: () => {
                reject(new Error('Google authentication failed to start'));
            },
        });

        tokenClient.requestAccessToken();
    });
};

export const getStoredGoogleAuth = () => {
    try {
        const raw = window.localStorage.getItem(GOOGLE_AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearGoogleAuth = () => {
    window.localStorage.removeItem(GOOGLE_AUTH_KEY);
};

export const connectGoogleCalendar = async (config) => {
    const tokenResponse = await requestAccessToken(config, 'consent');
    return storeGoogleAuth(tokenResponse);
};

export const disconnectGoogleCalendar = async () => {
    const stored = getStoredGoogleAuth();
    if (stored?.accessToken && window.google?.accounts?.oauth2?.revoke) {
        window.google.accounts.oauth2.revoke(stored.accessToken, () => {});
    }
    clearGoogleAuth();
};

export const getValidGoogleAccessToken = async (config) => {
    const stored = getStoredGoogleAuth();

    if (stored?.accessToken && isTokenValid(stored.expiresOn)) {
        return stored.accessToken;
    }

    throw new Error('Google sign-in required in Settings');
};
