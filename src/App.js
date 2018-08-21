import React, { Component } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow} from 'react-google-maps'
import ListViewItem from './components/ListViewItem'
import escapeRegExp from 'escape-string-regexp'

const fourSquareConfig = {
  'secrets': {
    'clientId': 'N3XZR40E5SSOTRPFD4RGBATEIBLPNHBUAUBN0LFXZCIQCW21',
    'clientSecret' : 'T2PUDE4YKR03JDN5BD5AS4KW42IOHH2213W4WNKZ1MHG0GVT',
    'redirectUrl': 'REDIRECT_URL'
  }
}

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
      { title: "Battery Park Beer Bar", position: { lat: 44.6668493, lng: -63.5699491 }, venueId: '567579ee498e2f30a8cac694' },
      { title: "Jost Vineyards", position: { lat: 45.796224, lng: -63.377246 }, venueId: '4be8181d947820a19271b4db' },
      { title: "Blomidon Estate Winery", position: { lat: 45.1570488, lng: -64.3926467 }, venueId: '4b76ea9bf964a520466a2ee3' },
      { title: "Avondale Sky Winery", position: { lat: 45.1124797, lng: -64.4008356 }, venueId: '503111bae4b0265f8c49d742' },
      { title: "Gasperau Vineyards", position: { lat: 45.0688838,lng: -64.3592938 }, venueId: '4be6e0bb910020a1a9b5d414' },
      { title: "Spindrift Brewing", position: { lat: 44.7141604, lng: -63.5852723}, venueId: '573c6c35498e9c48598a1ac7' },
      { title: "Muwin Estates Wines", position: { lat: 44.8299832, lng: -64.5139131}, venueId: '4cf1588ae9425481f6bd69c5' },
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
          <h1>NS Made</h1>
          <p>Beer and Wines</p>
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
