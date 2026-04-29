import React, { useState } from 'react';
import { Container, Card, Button, Modal, Form } from 'react-bootstrap';
import { MdDragHandle } from 'react-icons/md';
import useLocalStorage from '../hooks/useLocalStorage';
import CreateTaskModal from '../components/CreateTaskModal';
import trashcanIcon from '../sources/trashcan.png';

function TodoPage() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [categories, setCategories] = useLocalStorage('categories', [{ id: 1, name: 'Uncategorized' }]);
    const [showModalForCategory, setShowModalForCategory] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    const createCategory = () => {
        const categoryName = prompt('Enter new category name:');
        if (categoryName) {
            const newCategory = {
                id: Date.now(),
                name: categoryName,
            };
            setCategories([...categories, newCategory]);
        }
    };

    const handleSaveTask = (taskData) => {
        const newTask = { ...taskData, categoryId: showModalForCategory };
        setTasks([...tasks, newTask]);
    };

    const handleShowModal = (categoryId) => {
        setShowModalForCategory(categoryId);
    };

    const handleCloseModal = () => {
        setShowModalForCategory(null);
    };

    const deleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const toggleTaskCompletion = (taskId) => {
        setTasks(
            tasks.map((task) =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const isUncategorized = (categoryName) =>
        categoryName.trim().toLowerCase() === 'uncategorized';

    const deleteCategory = (categoryId) => {
        const categoryToDelete = categories.find((category) => category.id === categoryId);
        if (!categoryToDelete || isUncategorized(categoryToDelete.name)) {
            return;
        }

        const confirmed = window.confirm('Delete this category and all associated tasks?');
        if (!confirmed) {
            return;
        }

        setCategories(categories.filter((category) => category.id !== categoryId));
        setTasks(tasks.filter((task) => task.categoryId !== categoryId));
    };

    // Drag-and-drop handlers
    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnCategory = (e, categoryId) => {
        e.preventDefault();
        if (draggedTaskId) {
            setTasks(
                tasks.map((task) =>
                    task.id === draggedTaskId
                        ? { ...task, categoryId: categoryId }
                        : task
                )
            );
            setDraggedTaskId(null);
        }
    };

    // Edit modal handlers
    const openEditModal = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditDueDate(task.dueDate || '');
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setEditTitle('');
        setEditDescription('');
        setEditDueDate('');
    };

    const saveEditedTask = () => {
        if (editingTask) {
            setTasks(
                tasks.map((task) =>
                    task.id === editingTask.id
                        ? {
                            ...task,
                            title: editTitle,
                            description: editDescription,
                            dueDate: editDueDate,
                        }
                        : task
                )
            );
            closeEditModal();
        }
    };

    return (
        <Container fluid className="mt-4 h-100 flex-grow-1 overflow-hidden d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>To-Dos</h1>
                <Button onClick={createCategory}>New Category</Button>
            </div>
            <div className="category-scroll-container flex-grow-1 overflow-auto">
                <div className="category-scroll-track">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card-wrapper">
                            <Card
                                className="h-100"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnCategory(e, category.id)}
                                style={{
                                    borderStyle: draggedTaskId ? 'dashed' : 'solid',
                                    borderColor: draggedTaskId ? '#007bff' : '#dee2e6',
                                }}
                            >
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="d-flex justify-content-between align-items-center">
                                        <span>{category.name}</span>
                                        {!isUncategorized(category.name) && (
                                            <Button
                                                variant="link"
                                                className="p-0 border-0"
                                                onClick={() => deleteCategory(category.id)}
                                                aria-label={`Delete ${category.name} category`}
                                                title="Delete category"
                                            >
                                                <img src={trashcanIcon} alt="Delete" width="16" height="16" />
                                            </Button>
                                        )}
                                    </Card.Title>
                                    <div className="category-task-list flex-grow-1 mb-3">
                                        {tasks
                                            .filter((task) => task.categoryId === category.id)
                                            .map((task) => (
                                                <Card
                                                    key={task.id}
                                                    className={`mb-2 task-card ${task.completed ? 'task-completed' : ''}`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    style={{
                                                        opacity: draggedTaskId === task.id ? 0.5 : 1,
                                                        cursor: 'move',
                                                    }}
                                                >
                                                    <Card.Body className="d-flex align-items-center gap-2">
                                                        {/* Drag Handle */}
                                                        <div style={{ cursor: 'grab', color: '#999' }}>
                                                            <MdDragHandle size={20} />
                                                        </div>

                                                        {/* Clickable Content */}
                                                        <div
                                                            className="flex-grow-1"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => openEditModal(task)}
                                                        >
                                                            <strong>{task.title}:</strong> {task.description}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="d-flex gap-2">
                                                            <Button
                                                                variant={task.completed ? 'warning' : 'outline-warning'}
                                                                size="sm"
                                                                onClick={() => toggleTaskCompletion(task.id)}
                                                                aria-label={`Toggle complete for ${task.title}`}
                                                            >
                                                                ✓
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteTask(task.id);
                                                                }}
                                                                aria-label={`Delete task ${task.title}`}
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                    </div>
                                    <Button variant="primary" onClick={() => handleShowModal(category.id)}>
                                        + Add Task
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            <CreateTaskModal
                show={showModalForCategory !== null}
                handleClose={handleCloseModal}
                handleSave={handleSaveTask}
            />

            {/* Edit Task Modal */}
            <Modal show={editingTask !== null} onHide={closeEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeEditModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveEditedTask}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TodoPage;
