/* eslint-disable no-undef */
import React, { Component } from 'react'
import ListViewItem from './components/ListViewItem'
import escapeRegExp from 'escape-string-regexp'

const fourSquareConfig = {
  'secrets': {
    'clientId': 'N3XZR40E5SSOTRPFD4RGBATEIBLPNHBUAUBN0LFXZCIQCW21',
    'clientSecret' : 'KKGGWYKP1OBVRMVLQYWQBU1XCYK1CKVJEBSWRYOTVQVZD4BZ',
    'redirectUrl': 'REDIRECT_URL'
  }
}

// Global map variable
var map, markers, bounds, infoWindow

// const MapInfoWindow = (props) => {
//   return (<InfoWindow>
//     <div>
//       <div className="venue-data" tabIndex="1">
//         {props.venueData && <div className="venue-title"><h2><a href={`https://foursquare.com/v/${props.location.venueId}`}>{props.venueData.venue.name}</a></h2></div>}
//         {props.venueData && <div className="venue-description"><span className="venue-rating">Average rating: {props.venueData.venue.rating}</span></div>}
//         {props.venueData && <address>
//           <p>{props.venueData.venue.location.address}, {props.venueData.venue.location.city}</p>
//         </address>}
//         {props.venueData && <p>{props.venueData.venue.contact.formattedPhone}</p>}
//       </div>
//
//     </div>
//     </InfoWindow>)
// }

class App extends Component {
  state = {
    queryValue: "",
    allLocations: [
      { title: "Battery Park Beer Bar", position: { lat: 44.6668493, lng: -63.5699491 }, venueId: '567579ee498e2f30a8cac694', venueData: null },
      { title: "Jost Vineyards", position: { lat: 45.796224, lng: -63.377246 }, venueId: '4be8181d947820a19271b4db', venueData: null },
      { title: "Blomidon Estate Winery", position: { lat: 45.1570488, lng: -64.3926467 }, venueId: '4b76ea9bf964a520466a2ee3', venueData: null },
      { title: "Gasperau Vineyards", position: { lat: 45.0688838,lng: -64.3592938 }, venueId: '4be6e0bb910020a1a9b5d414', venueData: null },
      { title: "Avondale Sky Winery", position: { lat: 45.1124797, lng: -64.4008356 }, venueId: '503111bae4b0265f8c49d742', venueData: null },
      { title: "Spindrift Brewing", position: { lat: 44.7141604, lng: -63.5852723}, venueId: '573c6c35498e9c48598a1ac7', venueData: null },
      { title: "Muwin Estates Wines", position: { lat: 44.8299832, lng: -64.5139131}, venueId: '4cf1588ae9425481f6bd69c5', venueData: null },
    ],
    shownLocations: [],
    selectedLocation: null,
    mapCenterPosition: null,
    defaultCenter: {lat: 44.6463819, lng: -63.5912759 },
    infoWindowOpen: false,
    venueFromFoursquare: null
  }

  // When a location is selected, load up similar locations to state for InfoWindow to reference
  getFourSquareData = (location) => {
    // Get general info about the venue
    fetch(`https://api.foursquare.com/v2/venues/${location.venueId}?&client_id=${fourSquareConfig.secrets.clientId}&client_secret=${fourSquareConfig.secrets.clientSecret}&v=20180821`)
    .then(res => res.json())
    .then(data => this.setState({venueFromFoursquare: data.response}))

    // Get a photo if there is one
    // fetch(`https://api.foursquare.com/v2/venues/${location.venueId}/photos?&client_id=${fourSquareConfig.secrets.clientId}&client_secret=${fourSquareConfig.secrets.clientSecret}&v=20180821`)
    // .then(res => res.json())
    // .then()
  }

  componentWillMount(){
    // Copy the full list from the allLocations array
    let all = []

    for(let index in this.state.allLocations){
      all.push(this.state.allLocations[index])
    }

    // Copy this initial list to the shownLocations state too
    this.setState(state => ({
      allLocations: all,
      shownLocations: all,
      mapCenterPosition: this.state.defaultCenter
    }))
  }

  componentDidMount(){
    map = new google.maps.Map(document.getElementById('map'), {
          center: this.state.defaultCenter,
          zoom: 8
    });
    infoWindow = new google.maps.InfoWindow();
    this.updateMarkers();
  }

  updateMarkers(){
    let {shownLocations} = this.state
    let self = this
    markers = []
    for(let i = 0; i < shownLocations.length; i++){
      let marker = new google.maps.Marker({
        position: shownLocations[i].position,
        map: map,
        title: shownLocations[i].title
      })
      marker.addListener('click', function(){
        self.openInfoWindow(this, infoWindow)
      })
      markers.push(marker)
    }
  }

  updateBounds(){

  }

  openInfoWindow(marker, infoWindow){
    if(infoWindow.marker !== marker){
      infoWindow.marker = marker
      infoWindow.setContent()
      infoWindow.open(map, marker)

    }
  }

  selectLocation = (location) => {
    this.setState({
      selectedLocation: location,
      mapCenterPosition: location.position,
      infoWindowOpen: true
    })

    // Prevent calls during building of main app
    this.getFourSquareData(location)
  }

  deselectLocation = () => {
    this.setState({
      selectedLocation: null,
      infoWindowOpen: false,
      venueFromFoursquare: null,
      similarVenueData: null
    })
  }

  // Logic for selecting a location from the ListView
  onListViewItemFocused= (location, fromFocus) => {
    if(fromFocus && this.state.selectedLocation === location){
      this.deselectLocation();
      return
    }
    this.selectLocation(location)
  }

  // Logic for selecting a location from the marker
  onMarkerClicked = (location, fromFocus) => {
    // Marker specific changes go here
    if(this.state.selectedLocation === location){
      this.toggleInfoWindow();
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
    let {queryValue} = this.state

    return (
      <div className="app-container">
        <div className="side-bar">
          <h1>NS Made</h1>
          <p>Beer and Wines</p>
          <input type="text" value={queryValue} onChange={(e) => this.onQueryChange(e)} />
          {this.state.shownLocations.map(location => (<ListViewItem key={location.title} location={location} selected={location === this.state.selectedLocation} selectLocation={this.onListViewItemFocused}/>))}
        </div>
        <div className="map-container">
          <div id="map">
          </div>
        </div>
      </div>)
  }
}

export default App;
