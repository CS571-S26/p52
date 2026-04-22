import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TodoWidget from '../components/widgets/TodoWidget';
import NotesWidget from '../components/widgets/NotesWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import OutlookWidget from '../components/widgets/OutlookWidget';

function HomePage() {
    return (
        <Container fluid className="mt-4 h-100">
            <Row className="h-100">
                <Col md={4} className="d-flex flex-column">
                    <div className="flex-grow-1 d-flex">
                        <TodoWidget />
                    </div>
                </Col>
                <Col md={4} className="d-flex flex-column">
                    <div className="flex-grow-1 d-flex">
                        <NotesWidget />
                    </div>
                </Col>
                <Col md={4} className="d-flex flex-column">
                    <div className="d-flex flex-column gap-3 h-100">
                        <div className="flex-fill d-flex">
                            <CalendarWidget />
                        </div>
                        <div className="flex-fill d-flex">
                            <OutlookWidget />
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;