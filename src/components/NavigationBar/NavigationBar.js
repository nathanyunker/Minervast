import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, Outlet } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
    return (
      <>
      <Navbar bg="dark" variant='dark'>
          <Container>
              <Navbar.Brand href="#home">Minverast</Navbar.Brand>
              <Nav className="me-auto">
                <Nav.Link>
                  <Link className="navigational-link" to={"/"}>
                    Home
                  </Link>
                </Nav.Link>

                <Nav.Link>
                  <Link className="navigational-link" to={"/address-book"}>
                    Address Book
                  </Link>
                </Nav.Link>

                <Nav.Link>
                  <Link className="navigational-link" to={"/wish-list"}>
                    Wish List
                  </Link>
                </Nav.Link>
              </Nav>
          </Container>
      </Navbar>
      <Outlet></Outlet>
      </>
    )
}

export default NavigationBar;