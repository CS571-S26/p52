import React, { useState } from 'react';
import { Container, Form, Button, Alert, Stack } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    connectOutlook,
    disconnectOutlook,
    getStoredOutlookAuth,
} from '../services/outlookAuth';

function SettingsPage() {
    const [outlookConfig, setOutlookConfig] = useLocalStorage('outlookConfig', {
        clientId: '',
        tenantId: 'common',
    });
    const [clientId, setClientId] = useState(outlookConfig.clientId || '');
    const [tenantId, setTenantId] = useState(outlookConfig.tenantId || 'common');
    const [saved, setSaved] = useState(false);
    const [authStatus, setAuthStatus] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const storedAuth = getStoredOutlookAuth();

    const currentConfig = {
        clientId: clientId.trim(),
        tenantId: tenantId.trim() || 'common',
    };

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
            const auth = await connectOutlook(currentConfig);
            const label = auth.account.name || auth.account.username || 'Outlook account';
            setAuthStatus(`Connected as ${label}`);
        } catch (err) {
            setError(err.message || 'Outlook connection failed');
        } finally {
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
        </Container>
    );
}

export default SettingsPage;
