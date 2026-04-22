import React from 'react';
import { Card } from 'react-bootstrap';

function CalendarWidget() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Today's Calendar</Card.Title>
                {/* Calendar events will go here */}
            </Card.Body>
        </Card>
    );
}

export default CalendarWidget;
