import { PublicClientApplication } from '@azure/msal-browser';

const OUTLOOK_AUTH_KEY = 'outlookAuth';
const OUTLOOK_SCOPES = ['Mail.Read', 'User.Read'];
const NO_TOKEN_REQUEST_CACHE_ERROR = 'no_token_request_cache_error';

const isTokenValid = (expiresOnIso) => {
    if (!expiresOnIso) {
        return false;
    }

    const expiresMs = new Date(expiresOnIso).getTime();
    if (Number.isNaN(expiresMs)) {
        return false;
    }

    return expiresMs - Date.now() > 60_000;
};

const createMsalInstance = async (config) => {
    const clientId = (config?.clientId || '').trim();
    const tenantId = (config?.tenantId || '').trim();
    const redirectUri =
        (config?.redirectUri || '').trim() || `${window.location.origin}${window.location.pathname}`;

    if (!clientId || !tenantId) {
        throw new Error('Missing Outlook OAuth settings');
    }

    const msal = new PublicClientApplication({
        auth: {
            clientId,
            authority: `https://login.microsoftonline.com/${tenantId}`,
            redirectUri,
        },
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false,
        },
    });

    await msal.initialize();
    return msal;
};

export const finalizeOutlookRedirect = async (config) => {
    const msal = await createMsalInstance(config);

    try {
        const result = await msal.handleRedirectPromise();
        if (result?.accessToken) {
            const stored = setStoredOutlookAuth(result);
            return { completed: true, stored };
        }

        return { completed: false, stored: null };
    } catch (error) {
        if (error?.errorCode === NO_TOKEN_REQUEST_CACHE_ERROR) {
            return { completed: false, stored: null };
        }

        throw error;
    }
};

export const getStoredOutlookAuth = () => {
    try {
        const raw = window.localStorage.getItem(OUTLOOK_AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const setStoredOutlookAuth = (tokenResponse) => {
    const payload = {
        accessToken: tokenResponse.accessToken,
        expiresOn: tokenResponse.expiresOn ? tokenResponse.expiresOn.toISOString() : null,
        account: {
            homeAccountId: tokenResponse.account?.homeAccountId || '',
            username: tokenResponse.account?.username || '',
            name: tokenResponse.account?.name || '',
        },
    };

    window.localStorage.setItem(OUTLOOK_AUTH_KEY, JSON.stringify(payload));
    return payload;
};

export const clearOutlookAuth = () => {
    window.localStorage.removeItem(OUTLOOK_AUTH_KEY);
};

export const connectOutlook = async (config) => {
    const msal = await createMsalInstance(config);

    await msal.acquireTokenRedirect({
        scopes: OUTLOOK_SCOPES,
        prompt: 'select_account',
    });

    return null;
};

export const disconnectOutlook = async (config) => {
    const msal = await createMsalInstance(config);
    const stored = getStoredOutlookAuth();
    const account = msal
        .getAllAccounts()
        .find((item) => item.homeAccountId === stored?.account?.homeAccountId) || msal.getAllAccounts()[0];

    clearOutlookAuth();

    if (account) {
        await msal.logoutPopup({ account });
    }
};

export const getValidOutlookAccessToken = async (config) => {
    const stored = getStoredOutlookAuth();

    if (stored?.accessToken && isTokenValid(stored.expiresOn)) {
        return stored.accessToken;
    }

    const msal = await createMsalInstance(config);
    const account = msal
        .getAllAccounts()
        .find((item) => item.homeAccountId === stored?.account?.homeAccountId) || msal.getAllAccounts()[0];

    if (!account) {
        throw new Error('Outlook sign-in required in Settings');
    }

    const tokenResponse = await msal.acquireTokenSilent({
        scopes: OUTLOOK_SCOPES,
        account,
    });

    setStoredOutlookAuth(tokenResponse);
    return tokenResponse.accessToken;
};
