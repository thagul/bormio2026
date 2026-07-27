import { itinerary, places, restaurants, parking, checklists } from './index.js';
const ids=a=>new Set(a.map(x=>x.id)), p=ids(places), r=ids(restaurants), k=ids(parking), e=[];
for(const day of itinerary){for(const x of day.placeIds)if(!p.has(x))e.push(`${day.id}: luogo ${x}`);for(const x of day.restaurantIds)if(!r.has(x))e.push(`${day.id}: ristorante ${x}`);for(const x of day.parkingIds)if(!k.has(x))e.push(`${day.id}: parcheggio ${x}`);if(!checklists[day.checklistId])e.push(`${day.id}: checklist ${day.checklistId}`)}
if(e.length){console.error(e.join('\n'));process.exitCode=1}else console.log('Dataset valido');
