/* eslint-disable no-undef */
import React, { Component } from 'react'
import ReactDomServer from 'react-dom/server'
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
var map, markers, bounds, infoWindow, selectedMarker

class App extends Component {
  state = {
    queryValue: "",
    allLocations: [
      { title: "Battery Park Beer Bar", position: { lat: 44.6668493, lng: -63.5699491 }, venueId: '567579ee498e2f30a8cac694', venueData: null, infoWindowContent: null },
      { title: "Jost Vineyards", position: { lat: 45.796224, lng: -63.377246 }, venueId: '4be8181d947820a19271b4db', venueData: null, infoWindowContent: null },
      { title: "Blomidon Estate Winery", position: { lat: 45.1570488, lng: -64.3926467 }, venueId: '4b76ea9bf964a520466a2ee3', venueData: null, infoWindowContent: null },
      { title: "Gasperau Vineyards", position: { lat: 45.0688838,lng: -64.3592938 }, venueId: '4be6e0bb910020a1a9b5d414', venueData: null, infoWindowContent: null },
      { title: "Avondale Sky Winery", position: { lat: 45.1124797, lng: -64.4008356 }, venueId: '503111bae4b0265f8c49d742', venueData: null, infoWindowContent: null },
      { title: "Spindrift Brewing", position: { lat: 44.7141604, lng: -63.5852723}, venueId: '573c6c35498e9c48598a1ac7', venueData: null, infoWindowContent: null },
      { title: "Muwin Estates Wines", position: { lat: 44.8299832, lng: -64.5139131}, venueId: '4cf1588ae9425481f6bd69c5', venueData: null, infoWindowContent: null },
    ],
    shownLocations: [],
    selectedLocation: null,
    defaultCenter: {lat: 44.6463819, lng: -63.5912759 },
    infoWindowOpen: false,
    fourSquareFail: false
  }

  // When a location is selected, load up similar locations to state for InfoWindow to reference
  getFourSquareData = (location) => {
    // Get general info about the venue
    fetch(`https://api.foursquare.com/v2/venues/${location.venueId}?&client_id=${fourSquareConfig.secrets.clientId}&client_secret=${fourSquareConfig.secrets.clientSecret}&v=20180821`)
    .then(res => res.json())
    .then(data => this.setState({venueFromFoursquare: data.response}))
  }

  componentWillMount(){
    // Copy the full list from the allLocations array
    let all = []

    for(let index in this.state.allLocations){
      all.push(this.state.allLocations[index])
    }

    // Prefetch all location data from Foursquare to minimize calls
    let self = this
    new Promise(function(){
      for(let i = 0; i < all.length; i++){
        let location = all[i]

        // Utilize localStorage to save venue data, preventing multiple calls and quota being exceeded
        if(location.infoWindowContent !== null){
          console.log("InfoWindowContent already stored in the location... somehow!");
        } else if(localStorage.getItem(location.venueId) && location.infoWindowContent === null){
          let savedData = localStorage.getItem(location.venueId)
          // Set the location's infoWindow content from saved storage
          location.infoWindowContent = savedData
        } else {
          fetch(`https://api.foursquare.com/v2/venues/${location.venueId}?&client_id=${fourSquareConfig.secrets.clientId}&client_secret=${fourSquareConfig.secrets.clientSecret}&v=20180821`)
          .then(res => res.json())
          .then(data => {
            if(data.meta.code === 400 || data.meta.code === 429){
              self.setState({
                fourSquareFail: true
              })
            }
            let locationDataToJsx = self.generateInfoWindowContent(data.response, location)
            let savedData = ReactDomServer.renderToString(locationDataToJsx)
            location.infoWindowContent = savedData
            localStorage.setItem(location.venueId, savedData)
          })
          .catch((e) => console.log(e))
        }
        if(self.state.fourSquareFail) console.log("Failed to get data from Foursquare, minimal data will be show in InfoWindow");
      }
    })
    .then(() => this.setState({
      allLocations: all
    }))

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

    // Create new InfoWindow instance
    infoWindow = new google.maps.InfoWindow()

    let self = this
    // attach a Listener for closeclick event
    infoWindow.addListener('closeclick', () => {
      self.setState({
        infoWindowOpen: false
      })
    })

    // Initialize the array of markers
    this.createMarkers()
    this.updateMarkers(this.state.shownLocations)
    selectedMarker = null

    // create and update bounds for the map
    this.updateBounds()

    // Add window event listener to switch focus to the info window when space bar is pressed
    document.addEventListener('keydown', function(event){
      if(event.key === ' '){
        if(self.state.selectedLocation && self.state.infoWindowOpen){
          document.getElementById('info-window-heading').focus()
        }
        return true
      }
      return false
    })
  }

  createMarkers(){
    let self = this
    let {allLocations} = this.state
    markers = []
    for(let i = 0; i < allLocations.length; i++){
      let marker = new google.maps.Marker({
        position: allLocations[i].position,
        map: null,
        title: allLocations[i].title
      })
      marker.addListener('click', function(){
        self.onMarkerClicked(marker)
      })
      markers.push(marker)
    }
  }

  updateMarkers(shownLocations){
    let { allLocations } = this.state
    // Set the shownLocations map
    for(let i = 0; i < allLocations.length; i++){
      if(shownLocations.includes(allLocations[i])){
        markers[i].setMap(map)
      } else {
        markers[i].setMap(null)
      }
    }
  }

  updateBounds(){
    bounds = new google.maps.LatLngBounds()
    for(let i = 0; i < markers.length; i++){
      if(markers[i].getMap !== null){
        bounds.extend(markers[i].position)
      }
    }
    map.fitBounds(bounds)
  }

  selectLocation = (location) => {
    this.setState({
      selectedLocation: location,
      infoWindowOpen: true
    })

    // Grab the marker if it isn't already selected by being clicked
    if(selectedMarker === null){
      selectedMarker = this.getMarkerFromLocation(location)
    }

    // Center the map on the new location
    map.setCenter(location.position)
    // Open up the infoWindow
    selectedMarker.setAnimation(google.maps.Animation.BOUNCE)
    if(location.infoWindowContent !== null){
      infoWindow.setContent(location.infoWindowContent)
    } else {
      infoWindow.setContent(`<div className=""><h3 id="info-window-heading" tabIndex="0">${location.title}</h3><p tabindex="0">Foursquare information unavailable, try checking the <a href="https://foursquare.com/v/${location.venueId}">website for more details</a></div>`)
    }
    infoWindow.open(map, selectedMarker)
  }

  deselectLocation = () => {
    if(this.state.infoWindowOpen) infoWindow.close()

    this.setState({
      selectedLocation: null,
      infoWindowOpen: false,
      venueFromFoursquare: null,
      similarVenueData: null
    })

    // Reset map center on bounds
    map.fitBounds(bounds)

    // Null the selected marker for conditional use when new marker selected
    selectedMarker.setAnimation(null)
    selectedMarker = null
  }

  // Logic for selecting a location from the ListView
  onListViewItemFocused= (location, event) => {
    // Cancel focus event if the mouse was clicked, causing a double fire
    if(event.type === 'mousedown'){
      event.preventDefault()
    }
    if(this.state.selectedLocation === location){
      // location deselected by clicking it twice on the ListViewItem
      this.deselectLocation();
      return
    }
    //Cancel animation on previously selected marker
    if(selectedMarker !== null){
      selectedMarker.setAnimation(null)
    }
    // Save the marker
    selectedMarker = this.getMarkerFromLocation(location)

    this.selectLocation(location)
  }

  // Logic for selecting a location from the marker
  onMarkerClicked = (marker) => {
    // Get a reference to the location
    let location = this.getLocationFromMarker(marker)

    // Marker specific changes go here
    if(this.state.selectedLocation === location){
      this.toggleInfoWindow()
    } else {
      // If its not the first marker you've clicked, deselect the last one
      if(selectedMarker !== null) this.deselectLocation()
      selectedMarker = marker
      this.selectLocation(location)
    }
  }

  generateInfoWindowContent(data, location){
    let content = (<div>
        <div id="info-window-div" className="venue-data">
          {data && <div className="venue-title"><h2 id="info-window-heading" tabIndex="0"><a href={`https://foursquare.com/v/${location.venueId}`}>{data.venue.name}</a></h2></div>}
          {data && <div className="venue-description"><span className="venue-rating" tabIndex="0">Average rating: {data.venue.rating}</span></div>}
          {data && <address tabIndex="0">
            <p>{data.venue.location.address}, {data.venue.location.city}</p>
          </address>}
          {data && <p>{data.venue.contact.formattedPhone}</p>}
        </div>
    </div>)

    return content

  }

  getMarkerFromLocation(location){
    for(let i = 0; i < markers.length; i++){
      let markerLat = Number(markers[i].getPosition().lat().toFixed(7))
      let markerLng = Number(markers[i].getPosition().lng().toFixed(7))
      if(location.position.lat === markerLat && location.position.lng === markerLng){
        return markers[i]
      }
    }
  }

  getLocationFromMarker(marker){
    let markerLat = Number(marker.getPosition().lat().toFixed(7))
    let markerLng = Number(marker.getPosition().lng().toFixed(7))
    let location = this.state.allLocations.filter(loc => (markerLat === loc.position.lat && markerLng === loc.position.lng))
    return location[0]
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
      console.log("Showing all locations");
      shownLocations = this.state.allLocations
    }

    this.updateMarkers(shownLocations)
    this.setState({
      shownLocations: shownLocations
    })

    this.updateBounds()
  }

  toggleInfoWindow = () => {
    if(this.state.infoWindowOpen){
      infoWindow.close()
    } else {
      infoWindow.open(map, selectedMarker)
    }

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
          {this.state.shownLocations.map(location => (<ListViewItem key={location.title} location={location} selected={location === this.state.selectedLocation} onListViewFocused={this.onListViewItemFocused}/>))}
        </div>
        <div className="map-container">
          <div id="map">
          </div>
        </div>
      </div>)
  }
}

export default App;
