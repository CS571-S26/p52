import React, { useCallback, useEffect, useState } from 'react';
import { Card, Alert, ListGroup, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getStoredGoogleAuth, getValidGoogleAccessToken } from '../../services/googleAuth';

const formatEventDate = (event) => {
    const dateTime = event.start?.dateTime;
    const dateOnly = event.start?.date;

    if (dateTime) {
        const parsed = new Date(dateTime);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    }

    if (dateOnly) {
        const parsed = new Date(dateOnly);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
            });
        }
    }

    return 'No start time';
};

function CalendarWidget() {
    const EVENTS_LIST_MAX_HEIGHT = '14rem';

    const envGoogleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

    const [googleConfig] = useLocalStorage('googleConfig', {
        clientId: envGoogleClientId,
    });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const hasConfig = Boolean((googleConfig.clientId || '').trim());
    const hasAuth = Boolean(getStoredGoogleAuth());

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            if (!hasConfig) {
                setEvents([]);
                return;
            }

            const accessToken = await getValidGoogleAccessToken(googleConfig);
            const timeMin = encodeURIComponent(new Date().toISOString());
            const endpoint =
                'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
                `?singleEvents=true&orderBy=startTime&timeMin=${timeMin}&maxResults=50`;

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Google Calendar request failed (${response.status})`);
            }

            const data = await response.json();
            setEvents(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            setEvents([]);
            setError(err.message || 'Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    }, [googleConfig, hasConfig]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0">Google Calendar</Card.Title>
                    {!hasAuth ? <Link to="/settings">Configure</Link> : null}
                </div>

                {!hasConfig ? (
                    <Card.Text className="text-muted mb-0">
                        Add Google OAuth settings in Settings to enable calendar sync.
                    </Card.Text>
                ) : null}

                {hasConfig && !hasAuth ? (
                    <Card.Text className="text-muted mb-0">
                        Connect Google in Settings to view calendar events.
                    </Card.Text>
                ) : null}

                {loading ? (
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>Loading calendar...</span>
                    </div>
                ) : null}

                {error ? <Alert variant="warning" className="mb-2">{error}</Alert> : null}

                {!loading && !error && events.length > 0 ? (
                    <ListGroup
                        variant="flush"
                        className="flex-grow-1 overflow-auto"
                        style={{ maxHeight: EVENTS_LIST_MAX_HEIGHT }}
                    >
                        {events.map((event) => (
                            <ListGroup.Item key={event.id} className="px-0">
                                <div className="fw-semibold text-truncate" title={event.summary || '(No title)'}>
                                    {event.htmlLink ? (
                                        <a href={event.htmlLink} target="_blank" rel="noreferrer">
                                            {event.summary || '(No title)'}
                                        </a>
                                    ) : (
                                        event.summary || '(No title)'
                                    )}
                                </div>
                                <small className="text-muted">{formatEventDate(event)}</small>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : null}

                {!loading && !error && hasConfig && hasAuth && events.length === 0 ? (
                    <Card.Text className="text-muted mb-0">
                        No upcoming events found.
                    </Card.Text>
                ) : null}

                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-3"
                    onClick={loadEvents}
                    disabled={loading || !hasConfig || !hasAuth}
                >
                    Refresh
                </Button>
            </Card.Body>
        </Card>
    );
}

export default CalendarWidget;
