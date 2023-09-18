import { useState, useEffect } from 'react';
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

    return (
        <div>
            <h1>This will be your home page.... maybe put some todo's or something</h1>
            <Image className="pod-pic" src={pod.url} rounded />
            <div> {pod.title} </div>
            <div> {pod.explanation} </div>
        </div>
    );
}

export default Home;