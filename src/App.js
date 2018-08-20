import React, { Component } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow} from 'react-google-maps'
import ListViewItem from './components/ListViewItem'
import escapeRegExp from 'escape-string-regexp'

const FarmMap = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={8}
    defaultCenter={{lat: 44.6463819, lng: -63.5912759 }}
    center={props.centerMap}>
    {props.markers}
  </GoogleMap>
))

class App extends Component {
  state = {
    queryValue: "",
    allLocations: [
      { title: "Urban Roots", position: { lat: 44.6463819, lng: -63.5912759 } },
      { title: "Meander River Farm and Brewery", position: { lat: 45.0050258, lng: -63.9284117 } },
      { title: "Meadowbrook Meat Market", position: { lat: 45.0716169, lng: -64.7369145 } },
      { title: "Martock Glen", position: { lat: 44.965728,lng: -64.1370036 } },
      { title: "Fox Hill Cheese House", position: { lat: 45.1124797, lng: -64.4008356 } },
      { title: "Northumberlamb Lamb Co-op", position: { lat: 45.3894693,lng: -63.2487016 } },
      { title: "Holmestead Cheese", position: { lat: 44.9861486, lng: -64.7878241} },
      { title: "Cosman & Whidden honey", position: { lat: 45.0805578, lng: -64.4085428 } },
      { title: "Terra Beata", position: { lat: 44.3882738, lng: -64.2561627 } }
    ],
    shownLocations: [],
    selectedLocation: null,
    mapCenterPosition: null,
    defaultCenter: {lat: 44.6463819, lng: -63.5912759 },
    infoWindowOpen: false
  }

  componentWillMount(){
    // Copy the full list from the allLocations array
    let all = []
    for(let index in this.state.allLocations){
      all.push(this.state.allLocations[index])
    }
    // Copy this initial list to the shownLocations state too
    this.setState(state => ({
      shownLocations: all,
      mapCenterPosition: this.state.defaultCenter
    }))
  }

  selectLocation = (location) => {
    this.setState({
      selectedLocation: location,
      mapCenterPosition: location.position,
      infoWindowOpen: true
    })
  }

  deselectLocation = () => {
    this.setState({
      selectedLocation: null,
      infoWindowOpen: false
    })
  }

  // Logic for selecting a location from the ListView
  onListViewItemFocused= (location) => {
    if(this.state.selectedLocation === location){
      this.deselectLocation();
      return
    }
    this.selectLocation(location)
  }

  // Logic for selecting a location from the marker
  onMarkerClicked = (location) => {
    // Marker specific changes go here
    if(this.state.selectedLocation === location){
      if(!this.state.infoWindowOpen) this.toggleInfoWindow();
    } else {
      this.selectLocation(location)
    }

  }

  // Update the state to match any query change
  onQueryChange = (event) => {
    this.setState({
      queryValue: event.target.value
    })

    // Update filters
    this.filterLocations(event.target.value)
  }

  // Update the UI by changing the shownLocations. Takes in a string as state may be being set asynchronously
  filterLocations(value){
    let shownLocations
    if(value){
      let match = new RegExp(escapeRegExp(value), 'i')
      shownLocations = this.state.allLocations.filter((location) => match.test(location.title))
    } else if(value === ""){
      shownLocations = this.state.allLocations
    }

    this.setState({
      shownLocations: shownLocations
    })
  }

  toggleInfoWindow = () => {
    this.setState(state => ({
      infoWindowOpen: !state.infoWindowOpen
    }))

  }

  render() {
    let {shownLocations, queryValue, mapCenterPosition, infoWindowOpen, selectedLocation} = this.state
    let markers = []
    for(let i = 0; i < shownLocations.length; i++){
      markers.push(<Marker key={shownLocations[i].title}
        title={shownLocations[i].title}
        position={shownLocations[i].position}
        onClick={() => this.onMarkerClicked(shownLocations[i])}>
        {(infoWindowOpen && selectedLocation === shownLocations[i]) &&
            <InfoWindow onCloseClick={this.toggleInfoWindow}>
              <div>
                <h3>{shownLocations[i].title}</h3>
              </div>
            </InfoWindow>}
      </ Marker>)
    }
    return (
      <div className="app-container">
        <div className="side-bar">
          <h1>FarmsNS</h1>
          <input type="text" value={queryValue} onChange={(e) => this.onQueryChange(e)} />
          {this.state.shownLocations.map(location => (<ListViewItem key={location.title} location={location} selected={location === this.state.selectedLocation} selectLocation={this.onListViewItemFocused}/>))}
        </div>
        <div className="map-container">
          <FarmMap
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAq63dggi32I2hHW4Y9yzJjTdEzIbxbRto&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }}/>}
            containerElement={<div  style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            shownLocations={shownLocations}
            centerMap={mapCenterPosition}
            onMarkerClicked={this.onMarkerClicked}
            markers={markers}
            ></FarmMap>
        </div>
      </div>)
  }
}

export default App;
