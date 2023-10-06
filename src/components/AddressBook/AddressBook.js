import { useEffect } from 'react';
import { Amplify, API } from 'aws-amplify';
import awsconfig from '../../aws-exports';

Amplify.configure(awsconfig);


const AddressBook = () => {
  useEffect(() => {
    console.log('-----GOING TO GET ADDRESSESS-----');
    API.get('addressbookapi', '/address-book', {}).then(result => {
      console.log('-----GOT ADDRESSESS-----', result.body);
      const addresses = JSON.parse(result.body);
      console.log('----addresses----', addresses);
    }).catch(err => {
      console.log('--------UH OH, GOT AN ERROR-----');
      console.log(err);
    })
  }, [])


  return (
    <div>
      <h1>Here's were you're addresses will live!</h1>
    </div>
  );
}

export default AddressBook;