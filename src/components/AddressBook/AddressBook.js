import { useEffect, useState } from 'react';
import { Amplify, API } from 'aws-amplify';
import awsconfig from '../../aws-exports';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { Clipboard, Trash } from 'react-bootstrap-icons';

import './AddressBook.css';

Amplify.configure(awsconfig);


const AddressBook = () => {
  const defaultNewAddress = {
    addressTitle: '',
    addressText: ''
  }

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showDeleteAddressModal, setShowDeleteAddressModal] = useState(false);
  const [addAddressFormData, setAddAddressFormData] = useState(defaultNewAddress);
  const [addressList, setAddressList] = useState([{attrs: {title: "", text: "Loading Addresses"}}]);
  const [addressToDelete, setAddressToDelete] = useState({});

  const setField = (field, value) => {
    setAddAddressFormData({
      ...addAddressFormData,
      [field]: value
    })
  }

  const sumbitNewAddress = () => {
    const request = {
      body: {
        title: addAddressFormData.addressTitle,
        text: addAddressFormData.addressText
      },
      headers: {}
    }

    API.post('addressbookapi', '/address-book', request)
      .then(result => {
        console.log('-----Address Posted-----');
        setAddAddressFormData(defaultNewAddress);
        closeAddAddressModal();
        getAddressList();
      }).catch(err => {
        console.log('-----UH OH, GOT AN ERROR-----', err);

        //ADD ERROR MESSAGING
      })
  }

  const getAddressList = () => {
    console.log('-----------Going to get addresses----------');

    API.get('addressbookapi', '/address-book', {})
      .then(result => {
        console.log('-----Got Addresses-----', result);
        setAddressList(result);
      }).catch(err => {
        console.log('--------UH OH, GOT AN ERROR-----');
        console.log(err);
      })
  }

  const initiateDeleteAddress = (address) => {
    setAddressToDelete(address);
    openDeleteAddressModal();
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
      headers: {}
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
  const closeDeleteAddressModal = () => setShowDeleteAddressModal(false);
  const openDeleteAddressModal = () => setShowDeleteAddressModal(true);

  useEffect(() => {
    getAddressList();
  }, [])


  return (
    <div>
      <div className="add-address-button">
        <Button onClick={openAddAddressModal} variant="primary">Add Address</Button>
      </div>

      <div>
        <Modal show={showAddAddressModal} onHide={closeAddAddressModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add An Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Address Title</Form.Label>
              <Form.Control type="text" onChange={ e => setField('addressTitle', e.target.value) } placeholder="Enter Address Title" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={3} onChange={ e => setField('addressText', e.target.value) } placeholder="Enter Address" />
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
                  <Button onClick={() => {navigator.clipboard.writeText(address.attrs.text)}} variant="info">
                    <Clipboard></Clipboard>
                  </Button>
                </td>
                <td className="centered-table-cell">
                  <Button onClick={() => {initiateDeleteAddress(address.attrs)}} variant="danger">
                    <Trash></Trash>
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

export default AddressBook;