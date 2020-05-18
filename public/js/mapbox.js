/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaGFmaXptaG1kIiwiYSI6ImNrNXl5ZGRoODAxMXUza2xsZXlsb3B0bmEifQ.QSstVxeVPM3YpLKXwaTgRQ'

  var map = new mapboxgl.Map({
    container: 'map', //part of html id we want to inject
    style: 'mapbox://styles/hafizmhmd/cka12jora0slq1iukqn1t3zq9',
    scrollZoom: false,
  })

  //creating boundaries for displaying map
  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach((loc) => {
    //Create a point marker
    const el = document.createElement('div')
    el.className = 'marker'

    //set marker to the coordinates on data we got from DB
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', //the part that point to the exact GPS coordinate
    })
      .setLngLat(loc.coordinates)
      .addTo(map)

    //Add popup location info
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.description}</p>`)
      .addTo(map)

    //Extend map bound to include the current locations
    bounds.extend(loc.coordinates)
  })

  //to show a specific area of the map in view
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  })
}

// const displayMap = (locations) => {
//   mapboxgl.accessToken =
//     'pk.eyJ1IjoiaGFmaXptaG1kIiwiYSI6ImNrNXl5ZGRoODAxMXUza2xsZXlsb3B0bmEifQ.QSstVxeVPM3YpLKXwaTgRQ'

//   var map = new mapboxgl.Map({
//     container: 'map', //part of html id we want to inject
//     style: 'mapbox://styles/hafizmhmd/cka12jora0slq1iukqn1t3zq9',
//     scrollZoom: false,
//   })

//   //creating boundaries for displaying map
//   const bounds = new mapboxgl.LngLatBounds()

//   locations.forEach((loc) => {
//     //Create a point marker
//     const el = document.createElement('div')
//     el.className = 'marker'

//     //set marker to the coordinates on data we got from DB
//     new mapboxgl.Marker({
//       element: el,
//       anchor: 'bottom', //the part that point to the exact GPS coordinate
//     })
//       .setLngLat(loc.coordinates)
//       .addTo(map)

//     //Add popup location info
//     new mapboxgl.Popup({
//       offset: 30,
//     })
//       .setLngLat(loc.coordinates)
//       .setHTML(`<p>${loc.description}</p>`)
//       .addTo(map)

//     //Extend map bound to include the current locations
//     bounds.extend(loc.coordinates)
//   })

//   //to show a specific area of the map in view
//   map.fitBounds(bounds, {
//     padding: {
//       top: 200,
//       bottom: 150,
//       left: 100,
//       right: 100,
//     },
//   })
// }

// const mapBox = document.getElementById('map')

// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations)
//   displayMap(locations)
// }
