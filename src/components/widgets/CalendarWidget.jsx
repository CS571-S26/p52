import React, { useCallback, useEffect, useState } from 'react';
import { Card, Alert, ListGroup, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getStoredGoogleAuth, getValidGoogleAccessToken } from '../../services/googleAuth';
import { FaList, FaCalendar } from 'react-icons/fa';

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
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
    const [hoveredDayIdx, setHoveredDayIdx] = useState(null);

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

    // Build a map of dates with events for calendar view
    const eventsByDate = new Map();
    events.forEach((event) => {
        const dateTime = event.start?.dateTime;
        const dateOnly = event.start?.date;
        const dateStr = dateTime ? dateTime.split('T')[0] : dateOnly;
        if (dateStr) {
            if (!eventsByDate.has(dateStr)) {
                eventsByDate.set(dateStr, []);
            }
            eventsByDate.get(dateStr).push(event);
        }
    });

    // Generate calendar grid for displayed month
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays = [];
    let currentDate = new Date(startDate);
    while (currentDate <= lastDay || calendarDays.length % 7 !== 0) {
        calendarDays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        if (calendarDays.length >= 42) break; // Max 6 weeks
    }

    const monthName = firstDay.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const handlePreviousMonth = () => {
        if (displayMonth === 0) {
            setDisplayMonth(11);
            setDisplayYear(displayYear - 1);
        } else {
            setDisplayMonth(displayMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (displayMonth === 11) {
            setDisplayMonth(0);
            setDisplayYear(displayYear + 1);
        } else {
            setDisplayMonth(displayMonth + 1);
        }
    };

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title className="mb-0">Google Calendar</Card.Title>
                    <div className="d-flex gap-2">
                        {!hasAuth ? (
                            <Link to="/settings">Configure</Link>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'outline-secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FaList size={16} color={viewMode === 'list' ? 'white' : '#666'} />
                                </Button>
                                <Button
                                    variant={viewMode === 'calendar' ? 'secondary' : 'outline-secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FaCalendar size={16} color={viewMode === 'calendar' ? 'white' : '#666'} />
                                </Button>
                            </div>
                        )}
                    </div>
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

                {viewMode === 'list' && !loading && !error && events.length > 0 ? (
                    <ListGroup
                        variant="flush"
                        className="flex-grow-1 overflow-auto"
                        style={{ maxHeight: EVENTS_LIST_MAX_HEIGHT }}
                    >
                        {events.map((event) => (
                            <ListGroup.Item key={event.id} className="px-0 text-start">
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

                {viewMode === 'list' && !loading && !error && hasConfig && hasAuth && events.length === 0 ? (
                    <Card.Text className="text-muted mb-0">
                        No upcoming events found.
                    </Card.Text>
                ) : null}

                {/* Calendar View */}
                {viewMode === 'calendar' && !loading && !error && hasConfig && hasAuth ? (
                    <div className="flex-grow-1 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button variant="outline-secondary" size="sm" onClick={handlePreviousMonth}>
                                ←
                            </Button>
                            <h6 className="text-center mb-0 text-muted">{monthName}</h6>
                            <Button variant="outline-secondary" size="sm" onClick={handleNextMonth}>
                                →
                            </Button>
                        </div>
                        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-muted small fw-bold">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((date, idx) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const dayEvents = eventsByDate.get(dateStr) || [];
                                const hasEvent = dayEvents.length > 0;
                                const isCurrentMonth = date.getMonth() === displayMonth;
                                const isHovered = hoveredDayIdx === idx;
                                return (
                                    <div
                                        key={idx}
                                        className="d-flex flex-column align-items-center justify-content-center text-center position-relative"
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.4rem',
                                            backgroundColor: isCurrentMonth ? 'transparent' : '#f9f9f9',
                                            cursor: hasEvent ? 'pointer' : 'default',
                                            minHeight: '2.5rem',
                                        }}
                                        onMouseEnter={() => hasEvent && setHoveredDayIdx(idx)}
                                        onMouseLeave={() => setHoveredDayIdx(null)}
                                        title={hasEvent ? `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}
                                    >
                                        <small className={isCurrentMonth ? 'fw-normal' : 'text-muted fw-light'}>
                                            {date.getDate()}
                                        </small>
                                        {hasEvent && (
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#007bff', marginTop: '0.2rem' }} />
                                        )}

                                        {/* Hover Tooltip */}
                                        {isHovered && hasEvent && (
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    bottom: '100%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    marginBottom: '0.5rem',
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '0.4rem',
                                                    padding: '0.5rem',
                                                    minWidth: '200px',
                                                    maxWidth: '250px',
                                                    zIndex: 10,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                {dayEvents.slice(0, 3).map((event, i) => (
                                                    <div key={i} className="mb-1">
                                                        <div className="fw-semibold text-truncate small" title={event.summary}>
                                                            {event.summary}
                                                        </div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                                                            {formatEventDate(event)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                                        +{dayEvents.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
