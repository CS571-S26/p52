import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';
import CreateTaskModal from '../components/CreateTaskModal';
import trashcanIcon from '../sources/trashcan.png';

function TodoPage() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [categories, setCategories] = useLocalStorage('categories', [{ id: 1, name: 'Uncategorized' }]);
    const [showModalForCategory, setShowModalForCategory] = useState(null);

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

    return (
        <Container fluid className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>To-Dos</h1>
                <Button onClick={createCategory}>New Category</Button>
            </div>
            <Row>
                {categories.map((category) => (
                    <Col key={category.id}>
                        <Card className="h-100">
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
                                <div className="flex-grow-1">
                                    {tasks
                                        .filter((task) => task.categoryId === category.id)
                                        .map((task) => (
                                            <Card key={task.id} className="mb-2">
                                                <Card.Body className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{task.title}:</strong> {task.description}
                                                    </div>
                                                    <Button 
                                                        variant="outline-success" 
                                                        onClick={() => deleteTask(task.id)}
                                                        style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            padding: '0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        ✓
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                </div>
                                <Button variant="primary" onClick={() => handleShowModal(category.id)}>
                                    + Add Task
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <CreateTaskModal
                show={showModalForCategory !== null}
                handleClose={handleCloseModal}
                handleSave={handleSaveTask}
            />
        </Container>
    );
}

export default TodoPage;
