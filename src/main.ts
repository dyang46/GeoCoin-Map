import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";
import luck from "./luck";
import "./leafletWorkaround";
import { Locations } from"./board.ts";


//initial values
const MERRILL_CLASSROOM = leaflet.latLng({ 
    lat: 36.9995,
    lng: - 122.0533
});

const currentLat = MERRILL_CLASSROOM.lat;
const currentLng = MERRILL_CLASSROOM.lng; 

const currentPos = leaflet.latLng({
    lat: currentLat,
    lng: currentLng
});

//more initial values
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

//player setting
const playerMarker = leaflet.marker(MERRILL_CLASSROOM);
playerMarker.bindTooltip("That's you!").openTooltip();
playerMarker.addTo(map);


//interfaces for important values

interface Cell{
    i: number;
    j: number;
}

interface Coin{
    cell: Cell;
    value: number;
}

interface Cache{
    cell: Cell;
    coins: Coin[];
    marker: leaflet.Marker;
}



//inventory values
let points = 0;
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = "No points yet...";

//buttons place
const north = document.getElementById("north");
const south = document.getElementById("south");
const east = document.getElementById("east");
const west = document.getElementById("west");
//const sensor = document.getElementById("sensor");

test?.addEventListener("click", () => {
    //console.log(playerMarker.getLatLng());
    playerMarker.setLatLng(leaflet.latLng({ lat: currentLat, lng: currentLng }));
}
);

north?.addEventListener("click", () => {
    currentPos.lat += TILE_DEGREES;
    playerMarker.setLatLng(currentPos);
    //update();
}
);

south?.addEventListener("click", () => {
    currentPos.lat -= TILE_DEGREES;
    playerMarker.setLatLng(currentPos);
    //update();
}
);

east?.addEventListener("click", () => {
    currentPos.lng += TILE_DEGREES;
    playerMarker.setLatLng(currentPos);
    //update();
}
);

west?.addEventListener("click", () => {
    currentPos.lng -= TILE_DEGREES;
    playerMarker.setLatLng(currentPos);
    //update();
}
);




function roundUp(x: number): number{
    return Math.round(x * 10000);
}

function makeCell(lat:number,lng:number): Cell {
    return { i: roundUp(lat), j:  roundUp(lng) };
}

function makeCache(cell: Cell, totalCoins: number, marker:leaflet.Marker): Cache {
    const coins: Coin[] = [];
    
    // Generate a random value for each coin
    for (let i = 0; i < totalCoins; i++) {
        const value = i;
        coins.push({ cell, value });
    }
    
    return { cell, coins, marker };
}

/*function pushToCache(cache: Cache, coin: Coin) {
    cache.coins.push(coin);
}*/

/////TESTING WILL DELETE IN THE END/////
const testcell1: Cell = { i: 1, j: 2 };
const testcell2: Cell = { i: 3, j: 4 };
const testcell3:Cell = { i:100, j:100};
const testcell4: Cell = { i: 500, j: 100 };
///////////////



const posMap = new Locations(8); //to store all the grids
const collectedCoins: Coin[] = []; // to store all the collected coins

/////TESTING WILL DELETE IN THE END/////
const testingLocations = new Locations(8);
testingLocations.updateCell(testcell1);
testingLocations.updateCell(testcell2);
testingLocations.updateCell(testcell3);
testingLocations.printCells();
const testGet = testingLocations.getCellForPoint(MERRILL_CLASSROOM);
console.log(testGet.i, testGet.j);
const testcell5 = makeCell(MERRILL_CLASSROOM.lat,MERRILL_CLASSROOM.lng);
testingLocations.updateCell(testcell5);
testingLocations.printCells();
console.log(testingLocations.storedCell(testcell3));
console.log(testingLocations.storedCell(testcell4));
//////////////////////////////////////



for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
    for (let j = - NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
        console.log(i, j);

        const newCell = makeCell(MERRILL_CLASSROOM.lat + i * TILE_DEGREES, MERRILL_CLASSROOM.lng + j * TILE_DEGREES);
        posMap.updateCell(newCell);
        
        if (luck([i, j].toString()) < PIT_SPAWN_PROBABILITY) {
            console.log(luck([i, j].toString()));
            makePit(i, j, currentPos);

        }
    }
}

function makePit(i: number, j: number, center: leaflet.LatLng) {
    console.log(center);
    const pitPos = leaflet.latLng({
    lat: MERRILL_CLASSROOM.lat + i * TILE_DEGREES,
    lng: MERRILL_CLASSROOM.lng + j * TILE_DEGREES
    });
    const tCell = posMap.getCellForPoint(pitPos);
    const pit = leaflet.marker(pitPos);
    
    const value = Math.floor(luck([i, j, "initialValue"].toString()) * 100);
    const newCache = makeCache(tCell, value,pit);
    
    pit.bindPopup(() => {
        const container = document.createElement("div"); //popup container
        container.style.maxHeight = "200px";
        container.style.overflowY = "auto";
        
        const coinList = document.createElement("ul"); 
        coinList.style.padding = "0";
        coinList.style.listStyle = "none";     
        
        newCache.coins.forEach((coin, index) => { //display all current coins to the menu
            const coinItem = document.createElement("li");
            coinItem.style.display = "flex"; 
            coinItem.style.alignItems = "center"; 
    
            const coinInfo = document.createElement("span"); //message
            coinInfo.textContent = `${coin.cell.i}:${coin.cell.j}#${coin.value}`;
    
            const collectButton = document.createElement("button"); //button for collect
            collectButton.textContent = "Collect";
            collectButton.style.marginLeft = "10px"; 
    
            collectButton.addEventListener("click", () => { //click -> collected +1
                collectedCoins.push(coin);
                newCache.coins.splice(index, 1); //delete from old cache
                coinList.removeChild(coinItem); 
                points ++; 
                statusPanel.innerHTML = `${points} points collected`;
                
            });
    
            coinItem.appendChild(coinInfo);
            coinItem.appendChild(collectButton);
            coinList.appendChild(coinItem);
        });

        container.innerHTML = `
            <div>${newCache.cell.i},${newCache.cell.j}</div>
            <div>Coins:</div>
            <div id="coin-list"></div>
            <button id="deposite">deposite</button>`;
    
        const coinListContainer = container.querySelector("#coin-list");
        coinListContainer?.appendChild(coinList); 
        
    
        const deposite = container.querySelector<HTMLButtonElement>("#deposite")!;
        deposite.addEventListener("click", () => {
            if (points>0 && collectedCoins.length>0) {               
                
                const tempCoin = collectedCoins.pop()!;                
                newCache.coins.push(tempCoin);
                points--;
                statusPanel.innerHTML = `${points} points collected`;
                
                coinList.innerHTML = "";
                newCache.coins.forEach((coin, index) => {
                    const coinItem = document.createElement("li");
                    coinItem.style.display = "flex";
                    coinItem.style.marginLeft = "10px";
                
    
                    const coinInfo = document.createElement("span");
                
                    coinInfo.textContent = `${tempCoin.cell.i}:${tempCoin.cell.j}#${tempCoin.value}`;
                
    
                    const collectButton = document.createElement("button");
                    collectButton.textContent = "Collect";
                    collectButton.style.marginLeft = "10px"; // Add some spacing between coin info and button
    
                    collectButton.addEventListener("click", () => {
                        collectedCoins.push(coin);
                        newCache.coins.splice(index, 1); //delete from old cache
                        coinList.removeChild(coinItem);
                        points++;
                        statusPanel.innerHTML = `${points} points collected`;
    
              
                    });
    
                    coinItem.appendChild(coinInfo);
                    coinItem.appendChild(collectButton);
                    coinList.appendChild(coinItem);
                });       

            } else {
                alert("No Coin Left!!");
        }
        });    
        return container;
    });
    pit.addTo(map);
}