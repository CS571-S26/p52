import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import useLocalStorage from '../hooks/useLocalStorage';

function NotesPage() {
    const [notes, setNotes] = useLocalStorage('notes', []);
    const navigate = useNavigate();

    const createNote = () => {
        const now = new Date().toISOString();
        const newNote = {
            id: Date.now(),
            createdAt: now,
            updatedAt: now,
            title: 'New Note',
            content: '',
        };
        setNotes([...notes, newNote]);
        navigate(`/notes/${newNote.id}`);
    };

    return (
        <Container fluid className="py-4 h-100 flex-grow-1 overflow-auto">
            <h1>Notes</h1>
            <Button onClick={createNote}>New Note</Button>
            <Row>
                {notes.map((note) => (
                    <Col key={note.id} md={4} className="mb-3">
                        <Card>
                            <Card.Body className="text-start">
                                <Card.Title>
                                    <Link to={`/notes/${note.id}`}>{note.title}</Link>
                                </Card.Title>
                                <Card.Text className="note-preview-text">
                                    <ReactMarkdown>
                                        {(typeof note.content === 'string' ? note.content : '').slice(0, 100) || 'No content yet'}
                                    </ReactMarkdown>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default NotesPage;
