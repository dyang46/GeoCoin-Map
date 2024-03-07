import leaflet from "leaflet";

interface Cell {
    i: number;
    j: number;
}


export class Locations{

    readonly theRadius: number;

    private readonly knownCells: Map<string, Cell>;
    
    constructor(theRadius: number) {
        this.theRadius = theRadius;
        this.knownCells = new Map<string, Cell>;
    }

    updateCell(pos: Cell) {
        if (!this.storedCell(pos)) {
            const key = [pos.i, pos.j].toString();
            this.knownCells.set(key, pos);
        }
    
    }

    printCells() {
        console.log(this.knownCells.size);
        this.knownCells.forEach((value, key) => {
            console.log(`${key}: ${value.i} ${value.j}`);
        });
    }

    storedCell(pos: Cell) {
        const tempkey = [pos.i, pos.j].toString();
        return Array.from(this.knownCells.keys()).some(key =>
            key === tempkey
          );
    }
    private getCanonicalCell(cell: Cell): Cell {
        const { i, j } = cell;
        const key = [i, j].toString();
        if (!this.knownCells.has(key)) {
            this.knownCells.set(key, { i, j });
        }
        
        return this.knownCells.get(key)!;
    }

    getCellForPoint(point: leaflet.LatLng): Cell {
        return this.getCanonicalCell({
            i: Math.round(point.lat * 10000), j:  Math.round(point.lng * 10000)
        });
    }

    /*getCellBounds(cell: Cell): leaflet.LatLngBounds {
    	// ...
    }*/

    /*getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
        // ...
        return resultCells;
    }*/
}

