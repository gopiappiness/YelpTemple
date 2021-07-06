mapboxgl.accessToken=mapToken;
 // mapboxgl.accessToken ='<%-process.env.MAPBOX_TOKEN%>';
  const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center:campground.geometry.coordinates,// starting position [lng, lat]
   zoom:10// starting zoom
  });
  
  map.addControl(new mapboxgl.NavigationControl());
 
  //this using mapmarker
  new mapboxgl.Marker()
  .setLngLat(temple.geometry.coordinates)
  .setPopup(
      new mapboxgl.Popup({offset:25})
      .setHTML(
          `<h3>${temple.title}</h3><p>${temple.location}</p>`
      )
  )
  .addTo(map)