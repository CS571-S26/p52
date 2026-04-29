import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function CreateTaskModal({ show, handleClose, handleSave, isGoogleConnected }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [syncToGoogle, setSyncToGoogle] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setUrgency('medium');
        setSyncToGoogle(false);
    };

    const closeModal = () => {
        resetForm();
        handleClose();
    };

    const onSave = () => {
        handleSave({
            id: Date.now(),
            title,
            description,
            dueDate,
            urgency,
            completed: false,
            syncToCalendar: syncToGoogle,
        });
        closeModal();
    };

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Create New Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Due Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Urgency</Form.Label>
                        <Form.Select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Check
                            type="switch"
                            id="sync-to-calendar-switch"
                            label={isGoogleConnected ? 'Sync this task to Google Calendar' : 'Connect Google in Settings to sync this task'}
                            checked={syncToGoogle}
                            onChange={(e) => setSyncToGoogle(e.target.checked)}
                            disabled={!isGoogleConnected}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={onSave}>
                    Save Task
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CreateTaskModal;
