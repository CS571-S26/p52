import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';

const getDueTimestamp = (task) => {
    if (!task.dueDate) {
        return Number.POSITIVE_INFINITY;
    }

    const parsed = new Date(task.dueDate).getTime();
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

const formatDueDate = (task) => {
    if (!task.dueDate) {
        return 'No due date';
    }

    const parsed = new Date(task.dueDate);
    if (Number.isNaN(parsed.getTime())) {
        return 'No due date';
    }

    return parsed.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

function TodoWidget() {
    const [tasks] = useLocalStorage('tasks', []);
    const [categories] = useLocalStorage('categories', []);

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeCategories = Array.isArray(categories) ? categories : [];

    const categoryById = new Map(
        safeCategories.map((category) => [category?.id, category?.name || 'Uncategorized'])
    );
    const sortedTasks = [...safeTasks].sort((a, b) => getDueTimestamp(a) - getDueTimestamp(b));

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>
                    <Link to="/todos">To-Do List</Link>
                </Card.Title>

                {sortedTasks.length === 0 ? (
                    <Card.Text className="text-muted mb-0">No tasks yet.</Card.Text>
                ) : (
                    <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                        {sortedTasks.map((task) => (
                            <ListGroup.Item key={task.id} className="px-0">
                                <div
                                    className="fw-semibold text-truncate"
                                    title={typeof task.title === 'string' ? task.title : 'Untitled task'}
                                >
                                    {typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task'}
                                </div>
                                <small className="text-muted d-block">Due {formatDueDate(task)}</small>
                                <small
                                    className="text-muted d-block text-truncate"
                                    title={typeof task.description === 'string' ? task.description : ''}
                                >
                                    {(typeof task.description === 'string' ? task.description : '').slice(0, 80) ||
                                        'No description'}
                                </small>
                                <small className="text-muted d-block">
                                    {categoryById.get(task.categoryId) || 'Uncategorized'}
                                </small>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
}

export default TodoWidget;
