import { useEffect, useState } from 'react';
import { Amplify, API } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from '../../aws-exports';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { Clipboard, Pencil, Trash } from 'react-bootstrap-icons';

import './AddressBook.css';

Amplify.configure(awsconfig);


const AddressBook = ({ signOut, user }) => {
  const blankAddress = {
    title: '',
    text: ''
  }

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showUpdateAddressModal, setShowUpdateAddressModal] = useState(false);
  const [showDeleteAddressModal, setShowDeleteAddressModal] = useState(false);
  const [addAddressFormData, setAddAddressFormData] = useState(blankAddress);
  const [addressList, setAddressList] = useState([{attrs: {title: "", text: "Loading Addresses"}}]);
  const [unfilteredAddressList, setUnfilteredAddressList] = useState([]);
  const [addressToDelete, setAddressToDelete] = useState({});
  const [addressToUpdate, setAddressToUpdate] = useState({});

  const setAddAddressField = (field, value) => {
    setAddAddressFormData({
      ...addAddressFormData,
      [field]: value
    })
  }

  const setUpdateAddressField = (field, value) => {
    setAddressToUpdate({
      ...addressToUpdate,
      [field]: value
    })
  }

  const filterAddresses = (value) => {
    const lowerCasedValue = value.toLowerCase();
    if (!value) {
      setAddressList(unfilteredAddressList);
    } else {
      const filteredAddresses = unfilteredAddressList.filter(address => {
        let titleMatch;
        let textMatch;

        if (address.attrs.title) {
          titleMatch = address.attrs.title.toLowerCase().includes(lowerCasedValue);
        }

        if (address.attrs.text) {
          textMatch = address.attrs.text.toLowerCase().includes(lowerCasedValue);
        }

        return (titleMatch || textMatch);
      })

      setAddressList(filteredAddresses);
    }
  }

  const sumbitNewAddress = () => {
    console.log('----------THE USER----------', user);
    const request = {
      body: {
        title: addAddressFormData.title,
        text: addAddressFormData.text
      },
      headers: {
        "Authorization": `Bearer ${user.signInUserSession.accessToken.jwtToken}`
      }
    }

    API.post('addressbookapi', '/address-book', request)
      .then(result => {
        console.log('-----New Address Posted-----');
        setAddAddressFormData(blankAddress);
        closeAddAddressModal();
        getAddressList();
      }).catch(err => {
        console.log('-----UH OH, GOT AN ERROR in the create-----', err);

        //ADD ERROR MESSAGING
      })
  }

  const updateAddress = () => {
    console.log('------------ADDRESS TO UPDATE-----------', addressToUpdate);
    const request = {
      body: {
        title: addressToUpdate.title,
        text: addressToUpdate.text
      },
      queryStringParameters: {
        addressId: addressToUpdate.id,
      },
      headers: {
        "Authorization": `Bearer ${user.signInUserSession.accessToken.jwtToken}`
      }
    }
    console.log('------------ADDRESS TO UPDATE-----------', request);


    API.post('addressbookapi', '/address-book', request)
      .then(result => {
        console.log('-----Address Updated-----');
        setAddressToUpdate(blankAddress);
        closeUpdateAddressModal();
        getAddressList();
      }).catch(err => {
        console.log('-----UH OH, GOT AN ERROR in the update-----', err);

        //ADD ERROR MESSAGING
      })
  }

  const getAddressList = () => {
    console.log('-----------Going to get addresses----------');

    const request = {
      headers: {"Authorization": `Bearer ${user.signInUserSession.accessToken.jwtToken}`}
    }

    API.get('addressbookapi', '/address-book', request)
      .then(result => {
        console.log('-----Got Addresses-----', result);
        setAddressList(result);
        setUnfilteredAddressList(result);
      }).catch(err => {
        console.log('--------UH OH, GOT AN ERROR-----');
        console.log(err);
      })
  }

  const initiateAddressUpdate = (address) => {
    setAddressToUpdate(address);
    openUpdateAddressModal();
  }

  const initiateDeleteAddress = (address) => {
    setAddressToDelete(address);
    openDeleteAddressModal();
  }

  const abortAddressUpdate = () => {
    setAddressToUpdate({});
    closeUpdateAddressModal();
  }

  const abortAddressDeletion = () => {
    setAddressToDelete({});
    closeDeleteAddressModal();
  }

  const deleteAddress = () => {
    const request = {
      queryStringParameters: {
        addressId: addressToDelete.id,
      },
      headers: {
        "Authorization": `Bearer ${user.signInUserSession.accessToken.jwtToken}`
      }
    }

    console.log('------------GOING TO DELETE ADDRESS-------', addressToDelete)

    API.del('addressbookapi', '/address-book', request)
      .then(result => {
        console.log('-----Addresses Deleted-----');
        closeDeleteAddressModal()
        getAddressList();
        setAddressToDelete({}); // Empty the addressToDelete var
      }).catch(err => {
        console.log('--------UH OH, GOT AN ERROR-----');
        console.log(err);

        //ADD ERROR MESSAGING
      })
  }

  const closeAddAddressModal = () => setShowAddAddressModal(false);
  const openAddAddressModal = () => setShowAddAddressModal(true);
  const closeUpdateAddressModal = () => setShowUpdateAddressModal(false);
  const openUpdateAddressModal = () => setShowUpdateAddressModal(true);
  const closeDeleteAddressModal = () => setShowDeleteAddressModal(false);
  const openDeleteAddressModal = () => setShowDeleteAddressModal(true);

  useEffect(() => {
    getAddressList();
  }, [])


  return (
    <div>
      <div className="search-and-add-bar">
        <div className="search-address-bar">
          <Form.Control onChange={ e => filterAddresses(e.target.value) } size="lg" type="text" placeholder="Seach For Address" />
        </div>
        <div className="add-address-button">
          <Button onClick={openAddAddressModal} variant="primary">Add Address</Button>
        </div>
      </div>

      <div>
        <Modal show={showAddAddressModal} onHide={closeAddAddressModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add An Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Address Title</Form.Label>
              <Form.Control type="text" onChange={ e => setAddAddressField('title', e.target.value) } placeholder="Enter Address Title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={3} onChange={ e => setAddAddressField('text', e.target.value) } placeholder="Enter Address" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAddAddressModal}>
              Close
            </Button>
            <Button variant="primary" onClick={sumbitNewAddress}>
              Add
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div>
        <Modal show={showUpdateAddressModal} onHide={abortAddressUpdate}>
          <Modal.Header closeButton>
            <Modal.Title>Update Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Address Title</Form.Label>
              <Form.Control type="text" defaultValue={addressToUpdate.title} onChange={ e => setUpdateAddressField('title', e.target.value) } placeholder="Enter Address Title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" defaultValue={addressToUpdate.text} rows={3} onChange={ e => setUpdateAddressField('text', e.target.value) } placeholder="Enter Address" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={abortAddressUpdate}>
              Close
            </Button>
            <Button variant="primary" onClick={updateAddress}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      
      <div>
        <Modal show={showDeleteAddressModal} onHide={abortAddressDeletion}>
          <Modal.Header closeButton>
            <Modal.Title>Are You Sure??</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Do you really want to delete this address:</p>
            <p>{addressToDelete?.title}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={abortAddressDeletion} variant="secondary">Nevermind</Button>
            <Button onClick={deleteAddress} variant="danger">Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>

      <div className="address-list-table">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="uncentered-table-cell">Address Title</th>
              <th className="uncentered-table-cell">Address</th>
              <th className="centered-table-cell">Update Address</th>
              <th className="centered-table-cell">Copy Address</th>
              <th className="centered-table-cell">Delete Address</th>
            </tr>
          </thead>
          <tbody>
            {addressList.map((address, i) => (       
              <tr key={i}>
                <td className="uncentered-table-cell">{address.attrs.title}</td>
                <td className="uncentered-table-cell">{address.attrs.text}</td>
                <td className="centered-table-cell">
                  <Button onClick={() => {initiateAddressUpdate(address.attrs)}} variant="info">
                    { address.attrs.id &&
                      <Pencil></Pencil>
                    }
                  </Button>
                </td>
                <td className="centered-table-cell">
                  <Button onClick={() => {navigator.clipboard.writeText(address.attrs.text)}} variant="info">
                    { address.attrs.id &&
                      <Clipboard></Clipboard>
                    }
                  </Button>
                </td>
                <td className="centered-table-cell">
                  <Button onClick={() => {initiateDeleteAddress(address.attrs)}} variant="danger">
                    { address.attrs.id &&
                      <Trash></Trash>
                    }
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default withAuthenticator(AddressBook);