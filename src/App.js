import React, { Component } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker} from 'react-google-maps'

const FarmMap = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={8}
    defaultCenter={{lat: 44.6463819, lng: -63.5912759 }}>

  </GoogleMap>
))

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
    return (
      <div className="app-container">
        <div className="side-bar">
          <h1>FarmsNS</h1>
          <p>This is the side bar!</p>
        </div>
        <div className="map-container">
          <FarmMap
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAq63dggi32I2hHW4Y9yzJjTdEzIbxbRto&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }}/>}
            containerElement={<div  style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}></FarmMap>
        </div>
      </div>)
  }
}

export default App;
