import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function TodoWidget() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    <Link to="/todos">To-Do List</Link>
                </Card.Title>
                {/* Task list will go here */}
				
            </Card.Body>
        </Card>
    );
}

export default TodoWidget;
