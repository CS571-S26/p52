import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
    const [activeIndex, setActiveIndex] = useState(0);
    const safeNotes = Array.isArray(notes) ? notes : [];
    const sortedNotes = [...safeNotes].sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
    const activeNote = sortedNotes[activeIndex] || null;
    const notesCount = sortedNotes.length;

    useEffect(() => {
        if (activeIndex >= notesCount) {
            setActiveIndex(Math.max(0, notesCount - 1));
        }
    }, [activeIndex, notesCount]);

    const goPrevious = () => {
        setActiveIndex((current) => Math.max(0, current - 1));
    };

    const goNext = () => {
        setActiveIndex((current) => Math.min(notesCount - 1, current + 1));
    };

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="mb-0">
                        <Link to="/notes">Most Recent Notes</Link>
                    </Card.Title>
                    {notesCount > 0 && (
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={goPrevious}
                                disabled={activeIndex <= 0}
                                aria-label="Previous note"
                            >
                                ‹
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={goNext}
                                disabled={activeIndex >= notesCount - 1}
                                aria-label="Next note"
                            >
                                ›
                            </Button>
                        </div>
                    )}
                </div>

                {notesCount === 0 ? (
                    <Card.Text className="text-muted mb-0">No notes yet.</Card.Text>
                ) : (
                    <div className="note-carousel flex-grow-1 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 className="mb-1">
                                    <Link to={`/notes/${activeNote.id}`} className="text-decoration-none">
                                        {typeof activeNote.title === 'string' && activeNote.title.trim()
                                            ? activeNote.title
                                            : 'Untitled Note'}
                                    </Link>
                                </h6>
                                <small className="text-muted">Created {formatCreatedDate(activeNote)}</small>
                            </div>
                            <small className="text-muted">{activeIndex + 1}/{notesCount}</small>
                        </div>
                        <div className="note-preview-widget flex-grow-1 overflow-hidden card-preview-scroll">
                            {activeNote.content ? (
                                <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                            ) : (
                                <div className="text-muted">No content yet</div>
                            )}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

export default NotesWidget;
