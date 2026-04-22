import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NavigationBar() {
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand>P52 Project</Navbar.Brand>
                <Nav>
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/todos">To-Dos</Nav.Link>
                    <Nav.Link as={Link} to="/notes">Notes</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavigationBar