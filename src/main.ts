import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";
import luck from "./luck";
import "./leafletWorkaround";


const MERRILL_CLASSROOM = leaflet.latLng({
    lat: 36.9995,
    lng: - 122.0533
});

const currentLat = MERRILL_CLASSROOM.lat + 0.0001;
const currentLng = MERRILL_CLASSROOM.lng + 0.0001;

//currentLng.lat += 1;
const newPos = leaflet.latLng({ lat: currentLat, lng: currentLng });
console.log(newPos);
console.log(MERRILL_CLASSROOM);


const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
const NEIGHBORHOOD_SIZE = 8;
const PIT_SPAWN_PROBABILITY = 0.1;
const mapContainer = document.querySelector<HTMLElement>("#map")!;
const test = document.getElementById("test");
const map = leaflet.map(mapContainer, {
    center: MERRILL_CLASSROOM,
    zoom: GAMEPLAY_ZOOM_LEVEL,
    minZoom: GAMEPLAY_ZOOM_LEVEL,
    maxZoom: GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

const playerMarker = leaflet.marker(MERRILL_CLASSROOM, { draggable: true });
playerMarker.bindTooltip("That's you!");
playerMarker.addTo(map);

let points = 0;
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = "No points yet...";

function makePit(i: number, j: number) {
    const bounds = leaflet.latLngBounds([
        [MERRILL_CLASSROOM.lat + i * TILE_DEGREES,
        MERRILL_CLASSROOM.lng + j * TILE_DEGREES],
        [MERRILL_CLASSROOM.lat + (i + 1) * TILE_DEGREES,
        MERRILL_CLASSROOM.lng + (j + 1) * TILE_DEGREES],
    ]);

    const pit = leaflet.rectangle(bounds) as leaflet.Layer;



    pit.bindPopup(() => {
        let value = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
        const container = document.createElement("div");
        container.innerHTML = `
                <div>There is a pit here at "${i},${j}". It has value <span id="value">${value}</span>.</div>
                <button id="collect">collect</button>
                <button id="deposite">deposite</button>`;
        const poke = container.querySelector<HTMLButtonElement>("#collect")!;
        const deposite = container.querySelector<HTMLButtonElement>("#deposite")!;
        poke.addEventListener("click", () => {
            if (value > 0) {
                value--;
                container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
                points++;
                statusPanel.innerHTML = `${points} points collected`;
            }
        });
        deposite.addEventListener("click", () => {
            if (points > 0) {
                value++;
                container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
                points--;
                statusPanel.innerHTML = `${points} points collected`;
            }
        });
        return container;
    });
    pit.addTo(map);
}

for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
    for (let j = - NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
        if (luck([i, j].toString()) < PIT_SPAWN_PROBABILITY) {
            makePit(i, j);
        }
    }
}

test?.addEventListener("click", () => {
    //console.log(playerMarker.getLatLng());
    playerMarker.setLatLng(newPos);
}
);

