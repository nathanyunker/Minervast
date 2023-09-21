import { useState, useEffect } from 'react';
import WebFont from 'webfontloader';
import Image from 'react-bootstrap/Image';
import './Home.css';


const Home = () => {
    const [pod, setPod] = useState(0);

    useEffect(() => {
        fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.REACT_APP_NASA_POD_API_KEY}`)
           .then((res) => res.json())
           .then((data) => {
              console.log("Hello out there");
              console.log(data);
              setPod(data)
            //   setPosts(data);
           })
           .catch((err) => {
              console.log(err.message);
           });
     }, [])

     useEffect(() => {
        WebFont.load({
          google: {
            families: ['Croissant One, Mukta']
          }
        });
       }, []);

    return (
        <div className='home-container'>
            <div className="pod-pic-container">
                <Image className="pod-pic" src={pod.url} rounded />
            </div>
            <div className="pod-title"> {pod.title} </div>
            <div className="pod-desc"> {pod.explanation} </div>
        </div>
    );
}

export default Home;