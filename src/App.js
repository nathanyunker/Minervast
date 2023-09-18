import React from 'react';
import './App.css';
import AddressBook from './components/AddressBook/AddressBook';
import NavigationBar from './components/NavigationBar/NavigationBar';
import WishList from './components/WishList/WishList';
import Home from './components/Home/Home';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      element: <NavigationBar />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/address-book",
          element: <AddressBook />
        },
        {
          path: "/wish-list",
          element: <WishList />
        }
      ]
    }
  ]
)

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
