import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import useLocalStorage from '../hooks/useLocalStorage';

function NoteEditor() {
    const { noteId } = useParams();
    const [notes, setNotes] = useLocalStorage('notes', []);
    const [isEditingContent, setIsEditingContent] = useState(false);
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
        <Container fluid className="py-4 h-100 d-flex flex-column flex-grow-1">
            <div className="d-flex justify-content-end mb-3 gap-2">
                <Button variant="danger" onClick={deleteNote}>Delete</Button>
                <Button variant="primary" onClick={() => navigate('/notes')}>Done</Button>
            </div>
            <Form className="d-flex flex-column flex-grow-1 overflow-hidden">
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        value={note.title}
                        onChange={(e) => updateNote({ title: e.target.value })}
                        className="fs-2"
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                    />
                </Form.Group>
                <Form.Group className="flex-grow-1 d-flex flex-column overflow-hidden">
                    {isEditingContent ? (
                        <Form.Control
                            as="textarea"
                            value={note.content}
                            onChange={(e) => updateNote({ content: e.target.value })}
                            onBlur={() => setIsEditingContent(false)}
                            rows={15}
                            placeholder="Start writing your note here..."
                            className="flex-grow-1 note-editor-textarea"
                            style={{ border: 'none', outline: 'none', boxShadow: 'none', resize: 'none' }}
                            autoFocus
                        />
                    ) : (
                        <div
                            className="note-markdown-preview flex-grow-1 overflow-auto p-3"
                            onClick={() => setIsEditingContent(true)}
                            style={{ cursor: 'text', minHeight: 0, border: '1px solid #e9ecef', borderRadius: '0.375rem' }}
                        >
                            {note.content ? (
                                <ReactMarkdown>{note.content}</ReactMarkdown>
                            ) : (
                                <div className="text-muted">Click here to edit note content...</div>
                            )}
                        </div>
                    )}
                </Form.Group>
            </Form>
        </Container>
    );
}

export default NoteEditor;
