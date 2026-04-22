import React, { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
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

    return (
        <Container fluid className="mt-4 h-100 flex-grow-1 overflow-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>To-Dos</h1>
                <Button onClick={createCategory}>New Category</Button>
            </div>
            <div className="category-scroll-container mb-4">
                <div className="category-scroll-track">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card-wrapper">
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
                                    <div className="category-task-list flex-grow-1 mb-3">
                                        {tasks
                                            .filter((task) => task.categoryId === category.id)
                                            .map((task) => (
                                                <Card
                                                    key={task.id}
                                                    className={`mb-2 task-card ${task.completed ? 'task-completed' : ''}`}
                                                >
                                                    <Card.Body className="d-flex justify-content-between align-items-center gap-2">
                                                        <div>
                                                            <strong>{task.title}:</strong> {task.description}
                                                        </div>
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
        </Container>
    );
}

export default TodoPage;
