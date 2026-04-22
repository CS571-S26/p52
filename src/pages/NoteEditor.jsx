import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';

function NoteEditor() {
    const { noteId } = useParams();
    const [notes, setNotes] = useLocalStorage('notes', []);
    const navigate = useNavigate();
    const note = notes.find((n) => n.id === parseInt(noteId));

    const updateNote = (updatedFields) => {
        const updatedNotes = notes.map((n) =>
            n.id === parseInt(noteId) ? { ...n, ...updatedFields } : n
        );
        setNotes(updatedNotes);
    };

    const deleteNote = () => {
        const updatedNotes = notes.filter((n) => n.id !== parseInt(noteId));
        setNotes(updatedNotes);
        navigate('/notes');
    };

    if (!note) {
        return <div>Note not found</div>;
    }

    return (
        <Container>
            <div className="d-flex justify-content-end mb-3 gap-2">
                <Button variant="danger" onClick={deleteNote}>Delete</Button>
                <Button variant="primary" onClick={() => navigate('/notes')}>Done</Button>
            </div>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        value={note.title}
                        onChange={(e) => updateNote({ title: e.target.value })}
                        className="fs-2"
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control
                        as="textarea"
                        value={note.content}
                        onChange={(e) => updateNote({ content: e.target.value })}
                        rows={15}
                        placeholder="Start writing your note here..."
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    />
                </Form.Group>
            </Form>
        </Container>
    );
}

export default NoteEditor;
