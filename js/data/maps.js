export function buildMapLinks(name, latitude, longitude) {
  const q = encodeURIComponent(name); const p = `${latitude},${longitude}`;
  return { apple:`https://maps.apple.com/?q=${q}&ll=${p}`, google:`https://www.google.com/maps/search/?api=1&query=${p}`, directionsApple:`https://maps.apple.com/?daddr=${p}&dirflg=d`, directionsGoogle:`https://www.google.com/maps/dir/?api=1&destination=${p}` };
}
export function getDayMarkers(day, places, parking) {
  const a=day.placeIds.map(id=>places.find(x=>x.id===id)).filter(Boolean).map(x=>({id:x.id,type:'place',name:x.name,latitude:x.coordinates.latitude,longitude:x.coordinates.longitude,description:x.description,maps:x.maps}));
  const b=day.parkingIds.map(id=>parking.find(x=>x.id===id)).filter(Boolean).map(x=>({id:x.id,type:'parking',name:x.name,latitude:x.coordinates.latitude,longitude:x.coordinates.longitude,description:x.strategy,maps:x.maps})); return [...a,...b];
}
export const getBounds = markers => markers.map(x=>[x.latitude,x.longitude]);
