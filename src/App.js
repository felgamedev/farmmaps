import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    allLocations: [
      { title: "Urban Roots Farm", position: { lat: 44.6463819, lng: -63.5912759 } },
      { title: "Meander River Farm and Brewery", position: { lat: 45.0050258, lng: -63.9284117 } },
      { title: "Meadowbrook Meat Market", position: { lat: 45.0716169, lng: -64.7369145 } },
      { title: "Elmsdale Farm", position: { lat: 44.6463819, lng: -63.5912759 } },
      { title: "Martock Glen Farm", position: { lat: 44.965728,lng: -64.1370036 } },
      { title: "Fox Hill Cheese House", position: { lat: 45.1124797, lng: -64.4008356 } },
      { title: "Northumberlamb Lamb Co-op", position: { lat: 45.3894693,lng: -63.2487016 } },
      { title: "Holmestead Cheese", position: { lat: 44.9861486, lng: -64.7878241} },
      { title: "Cosman & Whidden honey", position: { lat: 45.0805578, lng: -64.4085428 } },
      { title: "Terra Beata Farms", position: { lat: 44.3882738, lng: -64.2561627 } }
    ],
    shownLocations: []
  }

  render() {
    return (<h1>Hello world</h1>)
  }
}

export default App;
