import React, { useCallback, useEffect, useState } from 'react';
import { Card, Alert, ListGroup, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getStoredOutlookAuth, getValidOutlookAccessToken } from '../../services/outlookAuth';

const MESSAGES_ENDPOINT =
    'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages' +
    '?$top=5&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,webLink,isRead';

const formatReceived = (isoDate) => {
    if (!isoDate) {
        return 'Unknown time';
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown time';
    }

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

function OutlookWidget() {
    const envOutlookClientId = (import.meta.env.VITE_OUTLOOK_CLIENT_ID || '').trim();
    const envOutlookTenantId = (import.meta.env.VITE_OUTLOOK_TENANT_ID || 'common').trim();
    const envOutlookRedirectUri =
        (import.meta.env.VITE_OUTLOOK_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`).trim();

    const [outlookConfig] = useLocalStorage('outlookConfig', {
        clientId: envOutlookClientId,
        tenantId: envOutlookTenantId || 'common',
        redirectUri: envOutlookRedirectUri,
    });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadMessages = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            if (!outlookConfig.clientId) {
                setMessages([]);
                return;
            }

            const accessToken = await getValidOutlookAccessToken(outlookConfig);
            const response = await fetch(MESSAGES_ENDPOINT, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Graph request failed (${response.status})`);
            }

            const data = await response.json();
            setMessages(Array.isArray(data.value) ? data.value : []);
        } catch (err) {
            setMessages([]);
            setError(err.message || 'Failed to load inbox messages');
        } finally {
            setLoading(false);
        }
    }, [outlookConfig]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled) {
                return;
            }
            await loadMessages();
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [loadMessages]);

    const hasConfig = Boolean((outlookConfig.clientId || '').trim());
    const hasAuth = Boolean(getStoredOutlookAuth());

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column min-vh-0">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0">Outlook Inbox</Card.Title>
                    {!hasAuth ? <Link to="/settings">Configure</Link> : null}
                </div>

                {!hasConfig ? (
                    <Card.Text className="text-muted mb-0">
                        Add Outlook app settings in Settings to enable inbox sync.
                    </Card.Text>
                ) : null}

                {hasConfig && !hasAuth ? (
                    <Card.Text className="text-muted mb-0">
                        Connect Outlook in Settings to view inbox messages.
                    </Card.Text>
                ) : null}

                {loading ? (
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>Loading inbox...</span>
                    </div>
                ) : null}

                {error ? <Alert variant="warning" className="mb-2">{error}</Alert> : null}

                {!loading && !error && messages.length > 0 ? (
                    <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                        {messages.map((message) => (
                            <ListGroup.Item key={message.id} className="px-0">
                                <div className="fw-semibold text-truncate" title={message.subject || '(No subject)'}>
                                    {message.webLink ? (
                                        <a href={message.webLink} target="_blank" rel="noreferrer">
                                            {message.subject || '(No subject)'}
                                        </a>
                                    ) : (
                                        message.subject || '(No subject)'
                                    )}
                                </div>
                                <small className="text-muted">
                                    From {message.from?.emailAddress?.name || message.from?.emailAddress?.address || 'Unknown'}
                                    {' | '}
                                    {formatReceived(message.receivedDateTime)}
                                    {message.isRead ? '' : ' | Unread'}
                                </small>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : null}

                {!loading && !error && hasConfig && hasAuth && messages.length === 0 ? (
                    <Card.Text className="text-muted mb-0">
                        No inbox messages found.
                    </Card.Text>
                ) : null}

                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-3"
                    onClick={loadMessages}
                    disabled={loading || !hasConfig || !hasAuth}
                >
                    Refresh
                </Button>
            </Card.Body>
        </Card>
    );
}

export default OutlookWidget;
