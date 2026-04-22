import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';

const getCreatedTimestamp = (note) => {
    if (note.createdAt) {
        const parsed = new Date(note.createdAt).getTime();
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    if (typeof note.id === 'number') {
        return note.id;
    }

    return 0;
};

const formatCreatedDate = (note) => {
    const timestamp = getCreatedTimestamp(note);
    if (!timestamp) {
        return 'Unknown date';
    }

    return new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

function NotesWidget() {
    const [notes] = useLocalStorage('notes', []);
    const sortedNotes = [...notes].sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>
                    <Link to="/notes">Most Recent Notes</Link>
                </Card.Title>

                {sortedNotes.length === 0 ? (
                    <Card.Text className="text-muted mb-0">No notes yet.</Card.Text>
                ) : (
                    <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                        {sortedNotes.map((note) => (
                            <ListGroup.Item key={note.id} className="px-0">
                                <div className="fw-semibold text-truncate" title={note.title || 'Untitled Note'}>
                                    <Link to={`/notes/${note.id}`}>{note.title || 'Untitled Note'}</Link>
                                </div>
                                <small className="text-muted d-block">Created {formatCreatedDate(note)}</small>
                                <small className="text-muted d-block text-truncate" title={note.content || ''}>
                                    {(note.content || '').slice(0, 80) || 'No content yet'}
                                </small>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
}

export default NotesWidget;
