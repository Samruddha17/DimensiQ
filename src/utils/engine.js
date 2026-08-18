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
      if (value === undefined || value === null || value === "" || Number.isNaN(Number(value))) {
        if (key !== "type" && key !== "constStyle" && key !== "doorStyle" && key !== "isHandle") {
          throw new Error(`CRITICAL STOP: Missing parameter [${key}]. The system strictly forbids assumption of unprovided hardware gaps or material dimensions.`);
        }
      }
    }

    return this.strategies[type].calculate(params);
  }
}

class StorageUnit {
  initParams(p) {
    this.W = parseFloat(p.W);
    this.H = parseFloat(p.H);
    this.D = parseFloat(p.D);
    this.T = parseFloat(p.T);
    this.T_door = parseFloat(p.T) + 2; // -2 for grooves or hinges
    this.T_back = parseFloat(p.T_back);
    this.H_lev = parseFloat(p.H_lev);
    this.isHandle = p.isHandle === "true";

    this.topCoversSides = p.constStyle === "top_covers";
    this.shelvesCount = parseInt(p.shelfCount, 10);
    this.doorStyle = p.doorStyle;

    this.backGap = 9;
    this.H_c = this.H - this.H_lev;
    this.D_c = this.D - this.T_door;
  }

  calculateSidePanels() {
    let parts = [];
    const sideH = this.topCoversSides ? this.H_c - this.T : this.H_c;
    parts.push({
      name: "Left Side Panel",
      qty: 1,
      dim1: sideH,
      dim2: this.D_c,
      thick: this.T,
      notes: "",
    });
    parts.push({
      name: "Right Side Panel",
      qty: 1,
      dim1: sideH,
      dim2: this.D_c,
      thick: this.T,
      notes: "",
    });
    return parts;
  }

  calculateTopPanel(T_Top, extendsTop) {
    let parts = [];
    const topW = this.topCoversSides ? this.W : this.W - 2 * this.T;
    parts.push({
      name: "Top Panel",
      qty: 1,
      dim1: topW,
      dim2: extendsTop ? this.D : this.D_c,
      thick: T_Top ? T_Top : this.T,
      notes: "",
    });
    return parts;
  }

  calculateBottomPanel() {
    let parts = [];
    parts.push({
      name: "Bottom Panel",
      qty: 1,
      dim1: this.W - 2 * this.T,
      dim2: this.D_c,
      thick: this.T,
      notes: "",
    });
    return parts;
  }

  calculateInternalShelves() {
    let parts = [];
    if (this.shelvesCount > 0) {
      parts.push({
        name: "Internal Shelf",
        qty: this.shelvesCount,
        dim1: this.W - 2 * this.T,
        dim2: this.D_c - this.T_back - this.backGap,
        thick: this.T,
        notes: "Clearance applied for back inset.",
      });
    }
    return parts;
  }

  calculateBackPanel(H_skirt = 0, T_Top = this.T) {
    let parts = [];
    const backW = this.W - 2 * this.T + 12;
    const backH = this.H_c - T_Top - this.T + 12 - H_skirt;
    parts.push({
      name: "Back Panel",
      qty: 1,
      dim1: backH,
      dim2: backW,
      thick: this.T_back,
      notes: "Inset Assembly: 6mm groove depth required on Top/Bottom/Left/Right inner faces",
    });
    return parts;
  }

  calculateDoors() {
    let parts = [];
    const Door_H = this.isHandle ? this.H_c : this.H_c + 5;
    if (this.doorStyle === "single") {
      parts.push({
        name: "Door (Single)",
        qty: 1,
        dim1: Door_H,
        dim2: this.W,
        thick: this.T_door,
        notes: "",
      });
    } else if (this.doorStyle === "double") {
      parts.push({
        name: "Door (Double Left)",
        qty: 1,
        dim1: Door_H,
        dim2: (this.W - 4) / 2,
        thick: this.T_door,
        notes: "Gap applied 2mm.",
      });
      parts.push({
        name: "Door (Double Right)",
        qty: 1,
        dim1: Door_H,
        dim2: (this.W - 4) / 2,
        thick: this.T_door,
        notes: "Gap applied 2mm.",
      });
    }
    return parts;
  }
}

class WallHangingStorageUnit extends StorageUnit {
  calculate(p) {
    this.initParams(p);
    let parts = [];
    parts.push(...this.calculateSidePanels());
    parts.push(...this.calculateTopPanel());
    parts.push(...this.calculateBottomPanel());
    parts.push(...this.calculateInternalShelves());
    parts.push(...this.calculateBackPanel());
    parts.push(...this.calculateDoors());

    // Standardize dimensions
    return parts.map((part) => {
      const l = Math.max(part.dim1, part.dim2);
      const w = Math.min(part.dim1, part.dim2);
      return { ...part, dim1: l, dim2: w };
    });
  }
}

class LowHeightStorageUnit extends StorageUnit {
  calculate(p) {
    console.log("Calculating Low Height Storage Unit with params:", p);
    this.initParams(p);
    const T_top = parseFloat(p.T_Top); // variable top thickness
    const H_skirt = parseFloat(p.H_skirt);
    const H_groove = !this.isHandle ? 25 : 0; // Groove height for door opening
    let parts = [];

    const calculateSidePanels = () => {
      const sideH = this.topCoversSides ? this.H_c - T_top : this.H_c;
      parts.push({
        name: "Left Side Panel",
        qty: 1,
        dim1: sideH,
        dim2: this.D_c,
        thick: this.T,
        notes: "",
      });
      parts.push({
        name: "Right Side Panel",
        qty: 1,
        dim1: sideH,
        dim2: this.D_c,
        thick: this.T,
        notes: "",
      });
    };

    const calculateDoors = () => {
      const Door_H = (this.topCoversSides ? this.H_c - T_top : this.H_c) - H_skirt - H_groove;
      if (this.doorStyle === "single") {
        parts.push({
          name: "Door (Single)",
          qty: 1,
          dim1: Door_H,
          dim2: this.W,
          thick: this.T_door,
          notes: "",
        });
      } else if (this.doorStyle === "double") {
        parts.push({
          name: "Door (Double Left)",
          qty: 1,
          dim1: Door_H,
          dim2: (this.W - 4) / 2,
          thick: this.T_door,
          notes: "Gap applied 2mm.",
        });
        parts.push({
          name: "Door (Double Right)",
          qty: 1,
          dim1: Door_H,
          dim2: (this.W - 4) / 2,
          thick: this.T_door,
          notes: "Gap applied 2mm.",
        });
      }
    };

    const calculateSkirtingPanel = () => {
      if (H_skirt > 0)
        parts.push({
          name: "Skirting Panel",
          qty: 1,
          dim1: H_skirt,
          dim2: this.W - 2 * this.T,
          thick: this.T,
          notes: "",
        });
    };

    const calculateGrooveCoverPanel = () => {
      if (H_groove > 0)
        parts.push({
          name: "Groove Cover Panel",
          qty: 1,
          dim1: 40,
          dim2: this.W - 2 * this.T,
          thick: this.T,
          notes: "",
        });
    };

    calculateSidePanels();
    parts.push(...this.calculateTopPanel(T_top, this.topCoversSides));
    parts.push(...this.calculateBottomPanel());
    parts.push(...this.calculateInternalShelves());
    parts.push(...this.calculateBackPanel(H_skirt));
    calculateDoors();
    calculateSkirtingPanel();
    calculateGrooveCoverPanel();

    // Standardize dimensions
    return parts.map((part) => {
      const l = Math.max(part.dim1, part.dim2);
      const w = Math.min(part.dim1, part.dim2);
      return { ...part, dim1: l, dim2: w };
    });
  }
}

export const engine = new CabinetFactory();

/**
 * STRATEGY: Wall Hanging Storage Unit
 */
engine.register("wall_hanging", new WallHangingStorageUnit());
engine.register("low_height", new LowHeightStorageUnit());
