import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import { MdEvent, MdDescription, MdCheckCircleOutline, MdRadioButtonUnchecked } from 'react-icons/md';
import { IoGrid } from 'react-icons/io5';

const getDueTimestamp = (task) => {
    if (!task.dueDate) {
        return Number.POSITIVE_INFINITY;
    }

    const parsed = new Date(task.dueDate).getTime();
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

const formatDueDate = (task) => {
    if (!task.dueDate) {
        return '';
    }

    const parsed = new Date(task.dueDate);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
};

function TodoWidget() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [categories] = useLocalStorage('categories', []);

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeCategories = Array.isArray(categories) ? categories : [];

    const categoryById = new Map(
        safeCategories.map((category) => [category?.id, category?.name || 'Uncategorized'])
    );
    const sortedTasks = [...safeTasks].sort((a, b) => getDueTimestamp(a) - getDueTimestamp(b));
    const incompleteTasks = sortedTasks.filter((task) => !task.completed);

    const toggleTaskComplete = (taskId) => {
        const updatedTasks = safeTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
    };

    return (
        <Card className="h-100 w-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>
                    <Link to="/todos">To-Do List</Link>
                </Card.Title>

                {sortedTasks.length === 0 ? (
                    <Card.Text className="text-muted mb-0">No tasks yet.</Card.Text>
                ) : incompleteTasks.length === 0 ? (
                    <Card.Text className="text-muted mb-0">All tasks completed!</Card.Text>
                ) : (
                    <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                        {incompleteTasks.map((task) => {
                            const title = typeof task.title === 'string' && task.title.trim() ? task.title : 'Untitled task';
                            const datePart = formatDueDate(task);
                            const categoryName = categoryById.get(task.categoryId) || 'Uncategorized';
                            const categoryPart = categoryName === 'Uncategorized' ? '' : categoryName;
                            const desc = typeof task.description === 'string' ? task.description.trim() : '';
                            const descPart = desc ? desc.slice(0, 120) : '';

                            return (
                                <ListGroup.Item key={task.id} className="px-0 text-start d-flex justify-content-between align-items-start gap-2">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            className={`fw-bold text-truncate ${task.completed ? 'text-decoration-line-through text-muted' : ''}`}
                                            title={title}
                                        >
                                            {title}
                                        </div>
                                        {(datePart || categoryPart || descPart) ? (
                                            <div className="d-flex align-items-center gap-2 text-muted small mt-1 overflow-hidden" style={{ minWidth: 0 }}>
                                                {datePart && (
                                                    <div className="d-flex align-items-center gap-1 text-nowrap">
                                                        <MdEvent size={14} color="#999" />
                                                        <span className="text-truncate" title={datePart}>{datePart}</span>
                                                    </div>
                                                )}
                                                {categoryPart && (
                                                    <div className="d-flex align-items-center gap-1 text-nowrap">
                                                        <IoGrid size={14} color="#999" />
                                                        <span className="text-truncate" title={categoryPart}>{categoryPart}</span>
                                                    </div>
                                                )}
                                                {descPart && (
                                                    <div className="d-flex align-items-center gap-1 text-nowrap">
                                                        <MdDescription size={14} color="#999" />
                                                        <span className="text-truncate" title={descPart}>{descPart}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                    <button
                                        onClick={() => toggleTaskComplete(task.id)}
                                        className="btn btn-sm p-0 text-muted flex-shrink-0"
                                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                        {task.completed ? (
                                            <MdCheckCircleOutline size={20} color="#28a745" />
                                        ) : (
                                            <MdRadioButtonUnchecked size={20} color="#999" />
                                        )}
                                    </button>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
}

export default TodoWidget;
