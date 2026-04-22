import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function NotesPage() {
    const [notes, setNotes] = useLocalStorage('notes', []);
    const navigate = useNavigate();

    const createNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'New Note',
            content: '',
        };
        setNotes([...notes, newNote]);
        navigate(`/notes/${newNote.id}`);
    };

    return (
        <Container>
            <h1>Notes</h1>
            <Button onClick={createNote}>New Note</Button>
            <Row>
                {notes.map((note) => (
                    <Col key={note.id} md={4} className="mb-3">
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <Link to={`/notes/${note.id}`}>{note.title}</Link>
                                </Card.Title>
                                <Card.Text>{note.content.substring(0, 100)}...</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default NotesPage;
