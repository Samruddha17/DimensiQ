/**
 * ENGINE ARCHITECTURE
 * Strategy Pattern for multi-type extensibility.
 * Enforces zero-assumption policy.
 */

class CabinetFactory {
    constructor() {
        this.strategies = {};
    }

    register(type, strategyObj) {
        this.strategies[type] = strategyObj;
    }

    calculate(type, params) {
        if (!this.strategies[type]) {
            throw new Error(`CRITICAL STOP: Strategy for "${type}" not registered.`);
        }

        // Zero-assumption validation
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null || value === '' || Number.isNaN(Number(value))) {
                console.log(key)
                if (key !== 'type' && key !== 'constStyle' && key !== 'doorStyle' && key !== 'isHandle') {
                    throw new Error(`CRITICAL STOP: Missing parameter [${key}]. The system strictly forbids assumption of unprovided hardware gaps or material dimensions.`);
                }
            }
        }

        return this.strategies[type].calculate(params);
    }
}

export const engine = new CabinetFactory();

/**
 * STRATEGY: Wall Hanging Storage Unit
 */
engine.register('wall_hanging', {
    calculate: (p) => {
        const W = parseFloat(p.W);
        const H = parseFloat(p.H);
        const D = parseFloat(p.D);
        const T = parseFloat(p.T);
        const T_door = parseFloat(p.T) - 2; //-2 for grooves or hinges
        const T_back = parseFloat(p.T_back);
        const H_lev = parseFloat(p.H_lev);
        const isHandle = p.isHandle === 'true' || p.isHandle === true;


        const topCoversSides = p.constStyle === 'top_covers';
        const shelvesCount = parseInt(p.shelfCount, 10);
        const doorStyle = p.doorStyle;

        const backGap = 9;
        const H_c = H - H_lev;
        const D_c = D - T_door;

        let parts = [];

        // 1. Side Panels
        const sideH = topCoversSides ? (H_c - T) : H_c;
        parts.push({ name: "Left Side Panel", qty: 1, dim1: sideH, dim2: D_c, thick: T, notes: "" });
        parts.push({ name: "Right Side Panel", qty: 1, dim1: sideH, dim2: D_c, thick: T, notes: "" });

        // 2. Top Panel
        const topW = topCoversSides ? W : (W - 2 * T);
        parts.push({ name: "Top Panel", qty: 1, dim1: topW, dim2: D_c, thick: T, notes: "" });

        // 3. Bottom Panel
        parts.push({ name: "Bottom Panel", qty: 1, dim1: W - 2 * T, dim2: D_c, thick: T, notes: "" });

        // 4. Internal Shelves
        if (shelvesCount > 0) {
            parts.push({ name: "Internal Shelf", qty: shelvesCount, dim1: W - 2 * T, dim2: D_c - T_back - backGap, thick: T, notes: "Clearance applied for back inset." });
        }

        // 5. Back Panel
        const backW = (W - 2 * T) + 12;
        const backH = (H_c - 2 * T) + 12;
        parts.push({ name: "Back Panel", qty: 1, dim1: backH, dim2: backW, thick: T_back, notes: "Inset Assembly: 6mm groove depth required on Top/Bottom/Left/Right inner faces" });

        // 6. Doors
        const Door_H = isHandle ? H_c : H_c + 5;
        if (doorStyle === 'single') {
            parts.push({ name: "Door (Single)", qty: 1, dim1: Door_H, dim2: W, thick: T_door, notes: "" });
        } else if (doorStyle === 'double') {
            parts.push({ name: "Door (Double Left)", qty: 1, dim1: Door_H, dim2: (W - 4) / 2, thick: T_door, notes: "Gap applied 2mm." });
            parts.push({ name: "Door (Double Right)", qty: 1, dim1: Door_H, dim2: (W - 4) / 2, thick: T_door, notes: "Gap applied 2mm." });
        }

        // Standardize dimensions
        return parts.map(part => {
            const l = Math.max(part.dim1, part.dim2);
            const w = Math.min(part.dim1, part.dim2);
            return { ...part, dim1: l, dim2: w };
        });
    }
});
