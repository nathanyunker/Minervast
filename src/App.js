import React from 'react';
import './App.css';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import AddressBook from './components/AddressBook/AddressBook';
import NavigationBar from './components/NavigationBar/NavigationBar';
import WishList from './components/WishList/WishList';
import Home from './components/Home/Home';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

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

function App({ signOut, user }) {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default withAuthenticator(App);
