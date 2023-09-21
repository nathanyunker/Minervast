import { API } from 'aws-amplify';

const AddressBook = () => {
  useEffect(() => {
    console.log('-----GOING TO GET ADDRESSESS-----');
    API.get('addressbookapi', '/address-book', {}).then(result => {
      console.log('-----GOT ADDRESSESS-----', result.body);
      this.addresses = JSON.parse(result.body);
    }).catch(err => {
      console.log('--------UH OH, GOT AN ERROR-----');
      console.log(err);
    })
  }, [])


  return (
    <div>
      <h1>Here's were you're addresses will live</h1>
    </div>
  );
}

export default AddressBook;