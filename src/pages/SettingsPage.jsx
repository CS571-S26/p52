import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Stack } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    connectOutlook,
    disconnectOutlook,
    getStoredOutlookAuth,
} from '../services/outlookAuth';
import {
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    getStoredGoogleAuth,
} from '../services/googleAuth';

function SettingsPage() {
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
    const [clientId, setClientId] = useState(outlookConfig.clientId || envOutlookClientId);
    const [tenantId, setTenantId] = useState(outlookConfig.tenantId || envOutlookTenantId || 'common');
    const [redirectUri, setRedirectUri] = useState(
        outlookConfig.redirectUri || envOutlookRedirectUri || detectedRedirectUri
    );
    const [saved, setSaved] = useState(false);
    const [authStatus, setAuthStatus] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [googleConfig, setGoogleConfig] = useLocalStorage('googleConfig', {
        clientId: envGoogleClientId,
    });
    const [googleClientId, setGoogleClientId] = useState(googleConfig.clientId || envGoogleClientId);
    const [googleSaved, setGoogleSaved] = useState(false);
    const [googleAuthStatus, setGoogleAuthStatus] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);

    const storedAuth = getStoredOutlookAuth();
    const storedGoogleAuth = getStoredGoogleAuth();

    const currentConfig = {
        clientId: clientId.trim(),
        tenantId: tenantId.trim() || 'common',
        redirectUri: redirectUri.trim() || detectedRedirectUri,
    };
    const currentGoogleConfig = {
        clientId: googleClientId.trim(),
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

    const saveOutlookConfig = (event) => {
        event.preventDefault();
        setOutlookConfig(currentConfig);
        setSaved(true);
        setError('');
    };

    const handleConnect = async () => {
        setSaved(false);
        setAuthStatus('');
        setError('');
        setIsConnecting(true);

        try {
            setOutlookConfig(currentConfig);
            setAuthStatus('Redirecting to Microsoft sign-in...');
            await connectOutlook(currentConfig);
        } catch (err) {
            setError(err.message || 'Outlook connection failed');
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setSaved(false);
        setAuthStatus('');
        setError('');
        setIsConnecting(true);

        try {
            await disconnectOutlook(currentConfig);
            setAuthStatus('Disconnected from Outlook');
        } catch (err) {
            setError(err.message || 'Unable to disconnect Outlook');
        } finally {
            setIsConnecting(false);
        }
    };

    const saveGoogleConfig = (event) => {
        event.preventDefault();
        setGoogleConfig(currentGoogleConfig);
        setGoogleSaved(true);
        setGoogleError('');
    };

    const handleGoogleConnect = async () => {
        setGoogleSaved(false);
        setGoogleAuthStatus('');
        setGoogleError('');
        setIsGoogleConnecting(true);

        try {
            setGoogleConfig(currentGoogleConfig);
            await connectGoogleCalendar(currentGoogleConfig);
            setGoogleAuthStatus('Connected to Google Calendar');
        } catch (err) {
            setGoogleError(err.message || 'Google connection failed');
        } finally {
            setIsGoogleConnecting(false);
        }
    };

    const handleGoogleDisconnect = async () => {
        setGoogleSaved(false);
        setGoogleAuthStatus('');
        setGoogleError('');
        setIsGoogleConnecting(true);

        try {
            await disconnectGoogleCalendar();
            setGoogleAuthStatus('Disconnected from Google Calendar');
        } catch (err) {
            setGoogleError(err.message || 'Unable to disconnect Google Calendar');
        } finally {
            setIsGoogleConnecting(false);
        }
    };

    return (
        <Container className="py-4">
            <h1>Settings</h1>
            <p className="text-muted mb-4">
                Configure integration credentials used by dashboard widgets.
            </p>

            {saved ? (
                <Alert variant="success" onClose={() => setSaved(false)} dismissible>
                    Settings saved.
                </Alert>
            ) : null}
            {authStatus ? <Alert variant="success">{authStatus}</Alert> : null}
            {error ? <Alert variant="danger">{error}</Alert> : null}
            {googleSaved ? (
                <Alert variant="success" onClose={() => setGoogleSaved(false)} dismissible>
                    Google settings saved.
                </Alert>
            ) : null}
            {googleAuthStatus ? <Alert variant="success">{googleAuthStatus}</Alert> : null}
            {googleError ? <Alert variant="danger">{googleError}</Alert> : null}

            <Form onSubmit={saveOutlookConfig} className="mb-4">
                <h4 className="mb-3">Outlook (Microsoft Graph)</h4>

                <Form.Group className="mb-3" controlId="outlookClientId">
                    <Form.Label>Application (client) ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={clientId}
                        onChange={(event) => setClientId(event.target.value)}
                        placeholder="GUID from Azure App Registration"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="outlookTenantId">
                    <Form.Label>Tenant ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={tenantId}
                        onChange={(event) => setTenantId(event.target.value)}
                    />
                    <Form.Text className="text-muted">
                        Use common for multi-tenant sign-in, or provide your tenant GUID.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="outlookRedirectUri">
                    <Form.Label>Redirect URI</Form.Label>
                    <Form.Control
                        type="url"
                        value={redirectUri}
                        onChange={(event) => setRedirectUri(event.target.value)}
                        placeholder={detectedRedirectUri}
                    />
                    <Form.Text className="text-muted">
                        Add this exact URI in Azure App Registration Authentication settings.
                    </Form.Text>
                </Form.Group>

                <Stack direction="horizontal" gap={2}>
                    <Button type="submit" variant="secondary">Save Outlook Settings</Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleConnect}
                        disabled={isConnecting || !currentConfig.clientId}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Outlook'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline-danger"
                        onClick={handleDisconnect}
                        disabled={isConnecting || !storedAuth}
                    >
                        Disconnect
                    </Button>
                </Stack>
            </Form>

            <p className="mb-0 text-muted">
                Required Microsoft Graph delegated permission: Mail.Read.
            </p>

            <hr className="my-4" />

            <Form onSubmit={saveGoogleConfig} className="mb-4">
                <h4 className="mb-3">Google Calendar</h4>

                <Form.Group className="mb-3" controlId="googleClientId">
                    <Form.Label>OAuth Client ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={googleClientId}
                        onChange={(event) => setGoogleClientId(event.target.value)}
                        placeholder="Google OAuth Web client ID"
                    />
                    <Form.Text className="text-muted">
                        Enable Google Calendar API and add this site origin in Google Cloud OAuth settings.
                    </Form.Text>
                </Form.Group>

                <Stack direction="horizontal" gap={2}>
                    <Button type="submit" variant="secondary">Save Google Settings</Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleGoogleConnect}
                        disabled={isGoogleConnecting || !currentGoogleConfig.clientId}
                    >
                        {isGoogleConnecting ? 'Connecting...' : 'Connect Google'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline-danger"
                        onClick={handleGoogleDisconnect}
                        disabled={isGoogleConnecting || !storedGoogleAuth}
                    >
                        Disconnect
                    </Button>
                </Stack>
            </Form>

            <p className="mb-0 text-muted">
                Required Google scope: calendar.readonly.
            </p>
        </Container>
    );
}

export default SettingsPage;
