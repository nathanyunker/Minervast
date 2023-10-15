import { withAuthenticator } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, Outlet } from 'react-router-dom';
import WebFont from 'webfontloader';
import './NavigationBar.css';
import { Button } from 'react-bootstrap';

const NavigationBar = ({ signOut, user }) => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Droid Sans', 'Chilanka']
      }
    });
   }, []);


  return (
    <>
    <Navbar bg="dark" variant='dark'>
        <Container >
            <Navbar.Brand className="navigational-brand" href="#home">Minervast</Navbar.Brand>
            <Nav className="me-auto navigational-link-container">
              <Link className="navigational-link" to={"/"}>
                Home
              </Link>
              <Link className="navigational-link" to={"/address-book"}>
                Address Book
              </Link>
              <Link className="navigational-link font-loader" to={"/wish-list"}>
                Wish List
              </Link>
            </Nav>
        </Container>
        <div className="sign-out">
          <Button className="navigational-link sign-out font-loader" variant="secondary" onClick={signOut} >
            Sign Out
          </Button>
        </div>
    </Navbar>
    <Outlet></Outlet>
    </>
  )
}

export default withAuthenticator(NavigationBar);