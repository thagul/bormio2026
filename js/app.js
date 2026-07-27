import { itinerary, places, restaurants, parking, checklists, settings, info, getDayMarkers } from '../data/index.js';

const main=document.querySelector('#main');
const backButton=document.querySelector('#back-button');
const searchButton=document.querySelector('#search-button');
const searchDialog=document.querySelector('#search-dialog');
const searchInput=document.querySelector('#global-search');
const searchResults=document.querySelector('#search-results');
const toast=document.querySelector('#toast');
const state={maps:[]};
const byId=(list,id)=>list.find(x=>x.id===id);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const favorites=()=>JSON.parse(localStorage.getItem('bormio:favorites')||'[]');
const isFav=id=>favorites().includes(id);
function toggleFavorite(id){const set=new Set(favorites());set.has(id)?set.delete(id):set.add(id);localStorage.setItem('bormio:favorites',JSON.stringify([...set]));showToast(set.has(id)?'Aggiunto ai preferiti':'Rimosso dai preferiti');render();}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1700)}
function image(item){return item?.localAsset||item?.heroImage||item?.fallbackImage||settings.app.fallbackHero}
function imageTag(item,alt,cls=''){return `<img class="${cls}" src="${esc(image(item))}" data-fallback="${esc(item?.fallbackImage||settings.app.fallbackHero||'')}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer">`}
function rawImageTag(url,alt,cls=''){return `<img class="${cls}" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer">`}
function restaurantGallery(r){const gallery=r.gallery||[];if(!gallery.length)return '';return `<section class="restaurant-gallery" aria-label="Galleria fotografica">${gallery.map(item=>`<figure class="restaurant-gallery-item">${rawImageTag(item.url,`${r.name} - ${item.type}`)}<figcaption>${esc(item.type)}</figcaption></figure>`).join('')}</section>`}

function mapButtons(item){return `<div class="button-row"><a class="button" target="_blank" rel="noopener" href="${item.maps.directionsApple}">Apple Maps</a><a class="button secondary" target="_blank" rel="noopener" href="${item.maps.directionsGoogle}">Google Maps</a></div>`}
function currentTripStatus(){const now=new Date();const start=new Date(settings.trip.startDate+'T00:00:00');const end=new Date(settings.trip.endDate+'T23:59:59');if(now<start)return {type:'before',days:Math.ceil((start-now)/86400000)};if(now>end)return {type:'after'};const iso=now.toLocaleDateString('en-CA',{timeZone:settings.trip.timezone});return {type:'during',day:itinerary.find(d=>d.date===iso)}}

function createMapIcon(type='place'){
  const normalized=String(type).toLowerCase();
  const emoji=normalized.includes('food')||normalized.includes('restaurant')?'🍴':
    normalized.includes('parking')?'P':
    normalized.includes('lago')||normalized.includes('lake')?'◉':
    normalized.includes('terme')?'♨':
    normalized.includes('treno')?'🚆':
    normalized.includes('cast')||normalized.includes('storia')?'◆':'●';
  return L.divIcon({
    className:'custom-map-marker',
    html:`<span>${emoji}</span>`,
    iconSize:[38,38],
    iconAnchor:[19,36],
    popupAnchor:[0,-34]
  });
}
function addLocateControl(map){
  if(!navigator.geolocation)return;
  const control=L.control({position:'topright'});
  control.onAdd=()=>{
    const button=L.DomUtil.create('button','locate-control');
    button.type='button';
    button.title='Mostra la mia posizione';
    button.setAttribute('aria-label','Mostra la mia posizione');
    button.innerHTML='⌖';
    L.DomEvent.disableClickPropagation(button);
    button.addEventListener('click',()=>{
      button.classList.add('loading');
      navigator.geolocation.getCurrentPosition(
        position=>{
          button.classList.remove('loading');
          const lat=position.coords.latitude;
          const lon=position.coords.longitude;
          const accuracy=position.coords.accuracy;
          L.circle([lat,lon],{radius:accuracy,weight:1,fillOpacity:.12}).addTo(map);
          L.marker([lat,lon],{
            icon:L.divIcon({
              className:'custom-map-marker current-location-marker',
              html:'<span>⌖</span>',
              iconSize:[40,40],
              iconAnchor:[20,38]
            })
          }).addTo(map).bindPopup('La tua posizione').openPopup();
          map.setView([lat,lon],Math.max(map.getZoom(),13));
        },
        ()=>{
          button.classList.remove('loading');
          alert('Posizione non disponibile. Verifica i permessi del browser.');
        },
        {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
      );
    });
    return button;
  };
  control.addTo(map);
}

function home(){const s=currentTripStatus();const status=s.type==='before'?`${s.days} giorni alla partenza`:s.type==='after'?'Vacanza terminata':s.day?.title||'Giornata libera';const first=byId(places,'bormio-centro');return `<section class="hero fade-in">${imageTag(first,'Bormio')}<div class="hero-content"><div class="eyebrow">13–22 agosto 2026</div><h1>Vacanza a Bormio</h1><p>Una raccolta di posti da scoprire e una proposta di pianificazione ancora modificabile.</p></div></section><section class="grid home-stats"><article class="card home-stat-card"><div class="eyebrow">Stato</div><div class="stat">${esc(status)}</div></article><article class="card home-stat-card"><div class="eyebrow">Base</div><div class="stat">Bormio</div><p class="muted">Italia e Svizzera</p></article><article class="card home-stat-card"><div class="eyebrow">Approccio</div><div class="stat">Ritmo comodo</div><p class="muted">Partenze normalmente tra le 10 e le 11.</p></article></section><section class="home-section"><h2>Prima scegli i posti</h2><div class="grid home-action-grid"><a class="card link-card home-action-card" href="#/luoghi"><div class="link-card-content"><div class="link-card-icon" aria-hidden="true">⌖</div><div><h3>Esplora i luoghi</h3><p class="muted">Schede indipendenti con descrizioni, mappe e consigli.</p></div></div><span class="link-card-arrow" aria-hidden="true">›</span></a><a class="card link-card home-action-card" href="#/food"><div class="link-card-content"><div class="link-card-icon" aria-hidden="true">♨</div><div><h3>Dove mangiare</h3><p class="muted">Ristoranti raccolti in una sezione dedicata e filtrabile.</p></div></div><span class="link-card-arrow" aria-hidden="true">›</span></a></div></section><section class="home-section"><h2>Poi valuta la proposta</h2><a class="card link-card link-card-featured" href="#/itinerario"><div class="link-card-content"><div class="link-card-icon" aria-hidden="true">◷</div><div><div class="eyebrow">Programma modificabile</div><h3>Proposta di pianificazione</h3><p class="muted">È soltanto una base: puoi cambiare ordine, giornate e destinazioni.</p></div></div><span class="link-card-arrow" aria-hidden="true">›</span></a></section><section class="home-section"><h2>Preferiti</h2><a class="card link-card" href="#/preferiti"><div class="link-card-content"><div class="link-card-icon" aria-hidden="true">☆</div><div><h3>Elementi salvati</h3><p class="muted">Luoghi, ristoranti e giornate che vuoi tenere in evidenza.</p></div></div><span class="link-card-arrow" aria-hidden="true">›</span></a></section>`}
function dayCard(day){const p=byId(places,day.heroPlaceId);return `<a class="card day-card" href="#/giorno/${day.id}">${imageTag(p,day.title)}<div><div class="day-meta"><div><div class="eyebrow">${esc(day.label)}</div><h3>${esc(day.title)}</h3></div></div><p class="muted">${esc(day.travel)}</p></div></a>`}
function itineraryPage(){return `<div class="eyebrow">Una base da modificare</div><h1>Proposta di pianificazione</h1><div class="notice"><strong>Questa non è una scaletta definitiva.</strong><p>Le schede dei luoghi restano indipendenti: puoi cambiare ordine, eliminare giornate o sostituire una meta senza perdere le informazioni.</p></div><p class="muted">Le partenze sono state rese più comode, generalmente tra le 10 e le 11. Questo può comportare più traffico o parcheggi meno vicini nelle mete più frequentate.</p><div class="timeline">${itinerary.map(dayCard).join('')}</div>`}
function dayPage(id){const day=byId(itinerary,id);if(!day)return notFound();const hero=byId(places,day.heroPlaceId);const dayPlaces=day.placeIds.map(id=>byId(places,id)).filter(Boolean);const dayParking=day.parkingIds.map(id=>byId(parking,id)).filter(Boolean);const list=checklists[day.checklistId]||[];return `<section class="hero route-hero fade-in">${imageTag(hero,day.title)}<div class="hero-content"><div class="eyebrow">${esc(day.label)}</div><h1>${esc(day.title)}</h1><p>${esc(day.travel)}</p></div></section><div class="notice"><strong>Proposta modificabile</strong><p>Questa giornata è un suggerimento e può essere invertita, accorciata o sostituita consultando la sezione Luoghi.</p></div><div class="section-head"><div><div class="eyebrow">Partenza indicativa</div><h2 style="margin-top:4px">${esc(day.startTime)}</h2></div></div><section class="card"><h3>Possibile svolgimento</h3>${day.schedule.map(x=>`<div class="schedule-item"><div class="time">${esc(x.time)}</div><div><strong>${esc(x.title)}</strong><div class="muted">${esc(x.description)}</div></div></div>`).join('')}</section><h2>Posti inclusi nella proposta</h2><div class="grid">${dayPlaces.map(placeCard).join('')}</div>${dayParking.length?`<h2>Parcheggio e accesso</h2>${dayParking.map(p=>`<article class="card"><h3>${esc(p.name)}</h3><p>${esc(p.strategy)}</p><div class="tags"><span class="chip">Affollamento: ${esc(p.risk)}</span></div><br>${mapButtons(p)}</article>`).join('')}`:''}<h2>Mappa della proposta</h2><div id="day-map" class="map"></div><h2>Consigli</h2><div class="notice"><ul>${day.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div><h2>Checklist</h2><section class="card checklist">${list.map(item=>{const key=`bormio:check:${day.id}:${item.id}`;return `<label><input type="checkbox" data-check="${key}" ${localStorage.getItem(key)==='1'?'checked':''}><span>${esc(item.label)}</span></label>`}).join('')}</section><p><a class="button secondary" href="#/food">Apri la sezione ristoranti</a></p>`}
function placeCard(p){return `<a class="card place-card clickable-card" data-category="${esc(p.category)}" href="#/luogo/${p.id}" aria-label="Apri ${esc(p.name)}">${imageTag(p,p.name)}<div class="section-head"><div><div class="eyebrow">${esc(p.category)}</div><h3>${esc(p.name)}</h3></div></div><p class="muted">${esc(p.description)}</p><span class="card-arrow" aria-hidden="true">›</span></a>`}
function placesPage(){const categories=[...new Set(places.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'it'));return `<div class="eyebrow">Guida</div><h1>Luoghi</h1><p class="muted">Seleziona una categoria. Tocca di nuovo il filtro attivo oppure scegli “Tutti” per rimuoverlo.</p><div class="place-filter-bar" role="group" aria-label="Filtra i luoghi"><button class="chip filter-chip active" type="button" data-filter="all" aria-pressed="true">Tutti</button>${categories.map(c=>`<button class="chip filter-chip" type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div><div id="places-grid" class="grid cols-3">${places.map(placeCard).join('')}</div>`}
function placePage(id){const p=byId(places,id);if(!p)return notFound();const whatToNotice=p.whatToNotice||p.highlights||[];const guideTips=p.guideTips||[];const placeParking=parking.filter(item=>item.destinationId===p.id);return `<section class="hero route-hero immersive-hero">${imageTag(p,p.name)}<div class="hero-content"><div class="eyebrow">${esc(p.area)}</div><h1>${esc(p.name)}</h1></div></section><div class="section-head"><h2>La visita</h2></div><p class="guide-lead">${esc(p.description)}</p><div class="details place-details"><div><strong>Quota</strong><br>${p.altitudeMeters?`${p.altitudeMeters} m`:'—'}</div><div><strong>Esperienza</strong><br>${esc(p.difficulty)}</div><div><strong>Categoria</strong><br>${esc(p.category)}</div></div>${p.whyVisit?`<h2>Perché merita</h2><section class="card guide-card"><p>${esc(p.whyVisit)}</p></section>`:''}<h2>Cosa osservare</h2><section class="card"><ul class="guide-list">${whatToNotice.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>${p.atmosphere?`<h2>Atmosfera e curiosità</h2><section class="card guide-card"><p>${esc(p.atmosphere)}</p></section>`:''}${guideTips.length?`<h2>Consigli della guida</h2><section class="card"><ul class="guide-list">${guideTips.map(x=>`<li>${esc(x)}</li>`).join('')}</section>`:''}${placeParking.length?`<h2>Parcheggio</h2>${placeParking.map(item=>`<section class="card parking-card"><h3>${esc(item.name)}</h3><p>${esc(item.strategy)}</p><div class="tags"><span class="chip">Affollamento: ${esc(item.risk)}</span></div><br>${mapButtons(item)}</section>`).join('')}`:''}<h2>Da sapere</h2><div class="notice"><ul>${p.verifyBeforeVisit.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><h2>Posizione</h2><div id="place-map" class="map"></div><br>${mapButtons(p)}${p.imageSource?`<p class="source photo-credit">Foto: <a target="_blank" rel="noopener" href="${p.imageSource}">${esc(p.imageCredit||'Wikimedia Commons')}</a>${p.imageLicense?` · ${esc(p.imageLicense)}`:''}</p>`:''}${p.officialUrl?`<p class="source"><a target="_blank" rel="noopener" href="${p.officialUrl}">Sito ufficiale / informazioni</a></p>`:''}`}
const foodFilters=[
  {id:'all',label:'Tutti',icon:'•'},
  {id:'da-non-perdere',label:'Da non perdere',icon:'★'},
  {id:'cucina-valtellinese',label:'Cucina valtellinese',icon:'◈'},
  {id:'pizza',label:'Pizza',icon:'◉'},
  {id:'aperitivo',label:'Aperitivo',icon:'◇'},
  {id:'panorama',label:'Panorama',icon:'△'},
  {id:'agriturismo',label:'Agriturismi',icon:'⌂'},
  {id:'vicino-centro',label:'Centro',icon:'⌖'},
  {id:'cena-speciale',label:'Cena speciale',icon:'✦'},
  {id:'all-aperto',label:'All’aperto',icon:'☼'}
];
const foodTagLabel=id=>foodFilters.find(x=>x.id===id)?.label||id;
function foodBadges(r){return `<div class="tags food-badges">${(r.tags||[]).map(id=>`<span class="chip food-badge ${id==='da-non-perdere'?'featured':''}">${esc(foodTagLabel(id))}</span>`).join('')}</div>`}
function foodCard(r){return `<a class="card food-card clickable-card" href="#/ristorante/${r.id}" aria-label="Apri ${esc(r.name)}">${imageTag(r,r.name)}<div class="section-head"><div><div class="eyebrow">${esc(r.cuisine)}</div><h3>${esc(r.name)}</h3></div></div>${foodBadges(r)}<p class="muted">${esc(r.description)}</p><span class="card-arrow" aria-hidden="true">›</span></a>`}
function foodPage(){const ordered=[...restaurants].sort((a,b)=>(b.featured===true)-(a.featured===true)||a.name.localeCompare(b.name,'it'));return `<div class="eyebrow">Guida gastronomica</div><h1>Dove mangiare</h1><p class="muted">Seleziona una categoria. Tocca nuovamente il filtro attivo oppure scegli “Tutti” per rimuoverlo.</p><div class="place-filter-bar food-filter-bar" role="group" aria-label="Filtra i ristoranti">${foodFilters.map((f,i)=>`<button class="chip filter-chip ${i===0?'active':''}" type="button" data-food-filter="${f.id}" aria-pressed="${i===0?'true':'false'}"><span class="filter-icon" aria-hidden="true">${f.icon}</span>${esc(f.label)}</button>`).join('')}</div><div id="food-grid" class="grid cols-3">${ordered.map(foodCard).join('')}</div><h2>Tutti sulla mappa</h2><div id="food-map" class="map"></div>`}
function restaurantPage(id){const r=byId(restaurants,id);if(!r)return notFound();return `<section class="hero route-hero immersive-hero">${imageTag(r,r.name)}<div class="hero-content"><div class="eyebrow">${esc(r.area)}</div><h1>${esc(r.name)}</h1><p>${esc(r.cuisine)}</p></div></section><div class="section-head"><h2>Il locale</h2></div>${foodBadges(r)}<p>${esc(r.description)}</p>${r.whyGo?`<section class="notice"><strong>Perché andarci</strong><p>${esc(r.whyGo)}</p></section>`:''}${restaurantGallery(r)}<section class="card"><h3>Da provare</h3><div class="tags">${r.recommendedDishes.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></section><h2>Come arrivare</h2><div id="restaurant-map" class="map"></div><br>${mapButtons(r)}<div class="button-row restaurant-actions">${r.phone?`<a class="button secondary" href="tel:${r.phone.replace(/\\s/g,'')}">Chiama</a>`:''}${r.officialUrl?`<a class="button ghost" target="_blank" rel="noopener" href="${r.officialUrl}">Sito ufficiale</a>`:''}</div><div class="notice">Verificare apertura estiva, orari e prenotazione prima di partire.</div>`}
function notFound(){return `<div class="empty"><h1>Pagina non trovata</h1><a class="button" href="#/home">Torna alla home</a></div>`}
function route(){const hash=location.hash||'#/home';const parts=hash.slice(2).split('/');const [name,id]=parts;backButton.classList.toggle('hidden',['home','itinerario','luoghi','food','info'].includes(name));document.querySelectorAll('.tabbar a').forEach(a=>a.classList.toggle('active',a.dataset.route===name));if(name==='home')return home();if(name==='itinerario')return itineraryPage();if(name==='giorno')return dayPage(id);if(name==='luoghi')return placesPage();if(name==='luogo')return placePage(id);if(name==='food')return foodPage();if(name==='ristorante')return restaurantPage(id);if(name==='info')return infoPage();if(name==='preferiti')return favoritesPage();return notFound()}
function destroyMaps(){state.maps.forEach(m=>m.remove());state.maps=[]}
function renderMaps(){if(typeof L==='undefined')return;const hash=location.hash;const mk=(el,markers)=>{if(!el||!markers.length)return;const map=L.map(el,{scrollWheelZoom:false});addLocateControl(map);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);markers.forEach(x=>L.marker([x.latitude,x.longitude]).addTo(map).bindPopup(`<strong>${esc(x.name)}</strong><br>${esc(x.description||'')}`));map.fitBounds(markers.map(x=>[x.latitude,x.longitude]),{padding:[28,28],maxZoom:13});state.maps.push(map)};if(hash.startsWith('#/giorno/')){const d=byId(itinerary,hash.split('/')[2]);mk(document.querySelector('#day-map'),getDayMarkers(d,places,parking))}if(hash.startsWith('#/luogo/')){const p=byId(places,hash.split('/')[2]);mk(document.querySelector('#place-map'),[{...p.coordinates,name:p.name,description:p.description}])}if(hash.startsWith('#/ristorante/')){const r=byId(restaurants,hash.split('/')[2]);mk(document.querySelector('#restaurant-map'),[{...r.coordinates,name:r.name,description:r.description}])}if(hash==='#/food'){mk(document.querySelector('#food-map'),restaurants.map(r=>({...r.coordinates,name:r.name,description:r.cuisine}))) }}
function bind(){document.querySelectorAll('[data-check]').forEach(c=>c.addEventListener('change',()=>localStorage.setItem(c.dataset.check,c.checked?'1':'0')));document.querySelectorAll('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{if(img.src!==img.dataset.fallback)img.src=img.dataset.fallback},{once:true}));document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{const current=document.querySelector('[data-filter].active');const requested=btn.dataset.filter;const reset=requested==='all'||btn===current;document.querySelectorAll('[data-filter]').forEach(x=>{const active=reset?x.dataset.filter==='all':x===btn;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});document.querySelectorAll('#places-grid .place-card').forEach(card=>{card.hidden=!reset&&card.dataset.category!==requested})}));document.querySelectorAll('[data-food-filter]').forEach(btn=>btn.addEventListener('click',()=>{const current=document.querySelector('[data-food-filter].active');const requested=btn.dataset.foodFilter;const reset=requested==='all'||btn===current;document.querySelectorAll('[data-food-filter]').forEach(x=>{const active=reset?x.dataset.foodFilter==='all':x===btn;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});const selected=reset?restaurants:restaurants.filter(r=>(r.tags||[]).includes(requested));document.querySelector('#food-grid').innerHTML=selected.sort((a,b)=>(b.featured===true)-(a.featured===true)||a.name.localeCompare(b.name,'it')).map(foodCard).join('');bind()}))}
function render(){destroyMaps();main.innerHTML=route();main.classList.add('fade-in');setTimeout(()=>main.classList.remove('fade-in'),300);window.scrollTo(0,0);bind();requestAnimationFrame(renderMaps);localStorage.setItem('bormio:lastRoute',location.hash)}
function search(q){const s=q.trim().toLowerCase();if(!s){searchResults.innerHTML='<div class="empty">Scrivi almeno una parola.</div>';return}const results=[...itinerary.map(x=>({type:'Giornata',title:x.title,text:[x.label,x.travel,...x.tips].join(' '),url:`#/giorno/${x.id}`})),...places.map(x=>({type:'Luogo',title:x.name,text:x.description+' '+x.highlights.join(' '),url:`#/luogo/${x.id}`})),...restaurants.map(x=>({type:'Ristorante',title:x.name,text:x.description+' '+x.recommendedDishes.join(' '),url:`#/ristorante/${x.id}`}))].filter(x=>(x.title+' '+x.text).toLowerCase().includes(s)).slice(0,30);searchResults.innerHTML=results.length?results.map(x=>`<a class="search-result" href="${x.url}"><div class="eyebrow">${x.type}</div><strong>${esc(x.title)}</strong><div class="muted">${esc(x.text.slice(0,110))}</div></a>`).join(''):'<div class="empty">Nessun risultato.</div>';searchResults.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>searchDialog.close()))}
backButton.addEventListener('click',()=>history.back());searchButton.addEventListener('click',()=>{searchDialog.showModal();searchInput.focus()});searchInput.addEventListener('input',()=>search(searchInput.value));window.addEventListener('hashchange',render);window.addEventListener('DOMContentLoaded',()=>{if(!location.hash)location.hash=localStorage.getItem('bormio:lastRoute')||'#/home';render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(console.warn)});
