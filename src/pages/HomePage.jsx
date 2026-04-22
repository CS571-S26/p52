import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TodoWidget from '../components/widgets/TodoWidget';
import NotesWidget from '../components/widgets/NotesWidget';
import CanvasWidget from '../components/widgets/CanvasWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import OutlookWidget from '../components/widgets/OutlookWidget';

function HomePage() {
    return (
        <Container fluid className="mt-4 h-100">
            <Row className="h-100">
                <Col md={4} className="d-flex flex-column">
                    <TodoWidget />
                </Col>
                <Col md={4} className="d-flex flex-column">
                    <NotesWidget />
                </Col>
                <Col md={4} className="d-flex flex-column">
                    <div className="d-grid gap-3">
                        <CanvasWidget />
                        <CalendarWidget />
                        <OutlookWidget />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;