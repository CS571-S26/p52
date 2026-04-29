import React, { useEffect, useState } from 'react';
import { Container, Button, Alert, Stack, Form } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    connectOutlook,
} from '../services/outlookAuth';
import {
    connectGoogleCalendar,
} from '../services/googleAuth';

function SettingsPage({ theme, onThemeToggle }) {
    const detectedRedirectUri = `${window.location.origin}${window.location.pathname}`;
    const envOutlookClientId = (import.meta.env.VITE_OUTLOOK_CLIENT_ID || '').trim();
    const envOutlookTenantId = (import.meta.env.VITE_OUTLOOK_TENANT_ID || 'common').trim();
    const envOutlookRedirectUri =
        (import.meta.env.VITE_OUTLOOK_REDIRECT_URI || detectedRedirectUri).trim();
    const envGoogleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

    const [outlookConfig, setOutlookConfig] = useLocalStorage('outlookConfig', {
        clientId: envOutlookClientId,
        tenantId: envOutlookTenantId || 'common',
        redirectUri: envOutlookRedirectUri || detectedRedirectUri,
    });
    const [googleConfig, setGoogleConfig] = useLocalStorage('googleConfig', {
        clientId: envGoogleClientId,
    });

    const [status, setStatus] = useState('');
    const [authStatus, setAuthStatus] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [googleAuthStatus, setGoogleAuthStatus] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);

    const currentConfig = {
        clientId: (outlookConfig.clientId || envOutlookClientId).trim(),
        tenantId: (outlookConfig.tenantId || envOutlookTenantId || 'common').trim(),
        redirectUri: (outlookConfig.redirectUri || envOutlookRedirectUri || detectedRedirectUri).trim(),
    };
    const currentGoogleConfig = {
        clientId: (googleConfig.clientId || envGoogleClientId).trim(),
    };

    useEffect(() => {
        if (!window.localStorage.getItem('outlookConfig')) {
            setOutlookConfig({
                clientId: envOutlookClientId,
                tenantId: envOutlookTenantId || 'common',
                redirectUri: envOutlookRedirectUri || detectedRedirectUri,
            });
        }

        if (!window.localStorage.getItem('googleConfig')) {
            setGoogleConfig({
                clientId: envGoogleClientId,
            });
        }
    }, [
        detectedRedirectUri,
        envGoogleClientId,
        envOutlookClientId,
        envOutlookRedirectUri,
        envOutlookTenantId,
        setGoogleConfig,
        setOutlookConfig,
    ]);

    const handleConnect = async () => {
        setStatus('');
        setAuthStatus('');
        setError('');
        setIsConnecting(true);

        try {
            if (!currentConfig.clientId) {
                throw new Error('Missing VITE_OUTLOOK_CLIENT_ID in environment settings.');
            }

            setOutlookConfig(currentConfig);
            setAuthStatus('Redirecting to Microsoft sign-in...');
            await connectOutlook(currentConfig);
        } catch (err) {
            setError(err.message || 'Outlook connection failed');
            setIsConnecting(false);
        }
    };

    const handleGoogleConnect = async () => {
        setStatus('');
        setGoogleAuthStatus('');
        setGoogleError('');
        setIsGoogleConnecting(true);

        try {
            if (!currentGoogleConfig.clientId) {
                throw new Error('Missing VITE_GOOGLE_CLIENT_ID in environment settings.');
            }

            setGoogleConfig(currentGoogleConfig);
            await connectGoogleCalendar(currentGoogleConfig);
            setGoogleAuthStatus('Connected to Google Calendar');
        } catch (err) {
            setGoogleError(err.message || 'Google connection failed');
        } finally {
            setIsGoogleConnecting(false);
        }
    };

    return (
        <Container fluid className="py-4 h-100 flex-grow-1 overflow-auto">
            <h1>Settings</h1>
            <p className="text-muted mb-4">
                Connect your accounts to enable dashboard integrations.
            </p>

            <Form className="mb-4">
                <Form.Check
                    type="switch"
                    id="theme-switch"
                    label={theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                    checked={theme === 'dark'}
                    onChange={onThemeToggle}
                />
            </Form>

            {status ? <Alert variant="success">{status}</Alert> : null}
            {authStatus ? <Alert variant="success">{authStatus}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}
            {googleAuthStatus ? <Alert variant="success">{googleAuthStatus}</Alert> : null}
            {googleError ? <Alert variant="danger">{googleError}</Alert> : null}

            <Stack gap={3} className="col-md-6">
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleConnect}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Connecting...' : 'Connect with Outlook'}
                </Button>

                <Button
                    type="button"
                    variant="danger"
                    size="lg"
                    onClick={handleGoogleConnect}
                    disabled={isGoogleConnecting}
                >
                    {isGoogleConnecting ? 'Connecting...' : 'Connect with Google'}
                </Button>
            </Stack>
        </Container>
    );
}

export default SettingsPage;
