import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotesWidget() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    <Link to="/notes">Most Recent Notes</Link>
                </Card.Title>
                {/* Note snippets will go here */}
            </Card.Body>
        </Card>
    );
}

export default NotesWidget;
