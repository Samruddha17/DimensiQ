import React, { useState } from "react";
import { engine } from "../utils/engine";
import CabinetFrontView from "../components/UiDiagram";

const SimpleStorageUnits = () => {
  // Single source of truth for UI state

  const initialInputs = {
    W: "",
    H: "",
    D: "",
    T: 18,
    T_back: 9,
    H_lev: 0,
    constStyle: "sides_cover",
    shelfCount: 1,
    doorStyle: "single",
    isHandle: "true",
    H_skirt: 0,
    T_Top: 18,
    type: "wall_hanging",
  };
  const [inputs, setInputs] = useState(initialInputs);

  const [cutList, setCutList] = useState([]);
  const [error, setError] = useState("");
  const [disabletopCoversSides, setDisableTopCoversSides] = useState(false);
  const [showOnUI, setShowOnUI] = useState(false);

  // Generic handler for all inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setInputs({ ...initialInputs, type: value });
      setCutList([]);
      setShowOnUI(false);
      return;
    }

    // if not wall hanging, then if handle is not present to the doors, it shall have top covered.
    if (inputs.type !== "wall_hanging") {
      if (name === "isHandle") {
        setInputs((prev) => ({
          ...prev,
          [name]: value,
          constStyle: "top_covers",
        }));

        value === "true" ? setDisableTopCoversSides(false) : setDisableTopCoversSides(true);
        return;
      }
    }
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    try {
      setError(""); // Reset errors
      const results = engine.calculate(inputs.type, inputs);
      setCutList(results);
      setShowOnUI(true);
    } catch (err) {
      setError(err.message);
      setCutList([]);
    }
  };

  // ---  CSV Export Logic ---
  const handleExportCSV = () => {
    if (cutList.length === 0) {
      alert("No data to export. Please generate a cut list first.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Component Name,Quantity,Length (mm),Width (mm),Thickness (mm),Notes\n";

    cutList.forEach((p) => {
      // Escape quotes in notes for CSV compatibility
      const safeNotes = p.notes.replace(/"/g, '""');
      csvContent += `"${p.name}",${p.qty},${p.dim1.toFixed(1)},${p.dim2.toFixed(1)},${p.thick},"${safeNotes}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${inputs.projectName || `Untitled - ${new Date().toISOString().slice(0, 19).replace("T", " ")}`}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden font-sans">
      {/* SIDEBAR: Inputs */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 relative">
        <div className="p-5 border-b border-slate-200 bg-slate-800 text-white">
          <h1 className="text-lg font-bold tracking-tight">DimensiQ</h1>
          <p className="text-xs text-slate-400 mt-1">A Elique Interiors Product</p>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div>
            <label className="block text-m font-semibold text-blue-800 uppercase tracking-wider mb-3">Project Name</label>
            <input type="text" name="projectName" value={inputs.projectName} onChange={handleInputChange} placeholder="e.g. Kitchen Cabinet" className="w-full text-sm border-slate-300 rounded-md shadow-sm bg-slate-50 p-2 border" />
          </div>

          {/* Storage Type */}
          <div>
            <label className="block text-xs text-center font-semibold text-slate-500 uppercase tracking-wider mb-2">--------------- Storage Type ---------------</label>
            <select name="type" value={inputs.type} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded-md shadow-sm bg-slate-50 p-2 border">
              <option value="wall_hanging">Wall Hanging Storage Unit</option>
              <option value="low_height">Low Height Storage Unit</option>
            </select>
          </div>

          {/* Outer Dimensions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3">Outer Dimensions (mm)</label>
            <div className="space-y-3">
              {["W", "H", "D"].map((dim) => (
                <div key={dim} className="flex items-center justify-between">
                  <label className="text-sm text-slate-700">
                    {dim === "W" ? "Width" : dim === "H" ? "Height" : "Depth"} ({dim})
                  </label>
                  <input type="number" name={dim} value={inputs[dim]} onChange={handleInputChange} placeholder="e.g. 600" className="w-24 text-sm border-slate-300 rounded p-1 text-right shadow-inner border" />
                </div>
              ))}
            </div>
          </div>

          {/* Core Parameters */}
          <div>
            <label className="block text-xs text-center font-semibold text-slate-500 uppercase tracking-wider mb-3">--------- Core Parameters (mm) ---------</label>
            <div className="space-y-3">
              {[
                { key: "T", label: "Ply Thickness" },
                { key: "T_back", label: "Back Thick" },
                { key: "H_lev", label: "Leveler Ht" },
              ].map((param) => (
                <div key={param.key} className="flex items-center justify-between">
                  <label className="text-sm text-slate-700">{param.label}</label>
                  <input type="number" name={param.key} value={inputs[param.key]} onChange={handleInputChange} className="w-20 text-sm border-slate-300 rounded p-1 text-right border" />
                </div>
              ))}
            </div>
          </div>

          {/* Construction Style */}
          <div>
            <label className="block text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">-------------- Construction --------------</label>

            <p className="text-sm text-slate-700 ">Door Handle?</p>
            <div className="mt-2 flex  items-center gap-5 justify-start align-middle">
              <label className="flex items-center space-x-2 text-sm">
                <input type="radio" name="isHandle" value="true" checked={inputs.isHandle === "true"} onChange={handleInputChange} className="text-blue-600 focus:ring-blue-500" />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input type="radio" name="isHandle" value="false" checked={inputs.isHandle === "false"} onChange={handleInputChange} className="text-blue-600 focus:ring-blue-500" />
                <span>No {inputs.type === "low_height" && "(groove)"}</span>
              </label>
            </div>

            <p className="text-sm text-slate-700 mt-4">Top Covers Sides?</p>
            <div className="mt-2 flex  items-center gap-5 justify-start align-middle">
              <label className="flex items-center space-x-2 text-sm">
                <input type="radio" name="constStyle" value="top_covers" checked={inputs.constStyle === "top_covers"} onChange={handleInputChange} className="text-blue-600 focus:ring-blue-500" disabled={disabletopCoversSides} />
                <span>Yes</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input type="radio" name="constStyle" value="sides_cover" checked={inputs.constStyle === "sides_cover"} onChange={handleInputChange} className="text-blue-600 focus:ring-blue-500" disabled={disabletopCoversSides} />
                <span>No</span>
              </label>
            </div>
            {inputs.constStyle === "top_covers" && inputs.type === "low_height" && (
              <div className="flex items-center justify-between mt-4">
                <label className="text-sm text-slate-700 mr-2">Top thickness</label>
                <input type="number" name="T_Top" value={inputs.T_Top} onChange={handleInputChange} className="w-20 text-sm border-slate-300 rounded p-1 text-right border" />
              </div>
            )}

            {inputs.type === "low_height" && (
              <div className="flex items-center justify-between mt-4">
                <label className="text-sm text-slate-700">Skirting</label>
                <input type="number" name="H_skirt" value={inputs.H_skirt} placeholder="eg: 50" onChange={handleInputChange} className="w-20 text-sm border-slate-300 rounded p-1 text-right border" />
              </div>
            )}
          </div>

          {/* Components */}
          <div>
            <label className="block text-xs text-center font-semibold text-slate-500 uppercase tracking-wider mb-2">------------ Internal & Doors ------------</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-700">Shelf Count (N)</label>
                <input type="number" name="shelfCount" value={inputs.shelfCount} min="0" onChange={handleInputChange} className="w-20 text-sm border-slate-300 rounded p-1 text-right border" />
              </div>
              <div>
                <select name="doorStyle" value={inputs.doorStyle} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded p-2 border">
                  <option value="none">No Doors (Open)</option>
                  <option value="single">Single Door</option>
                  <option value="double" disabled={inputs.W < 600}>
                    Double Doors
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-200">
            <button onClick={handleGenerate} className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded-md hover:bg-slate-700 transition shadow-sm">
              Generate Cut List
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA: Outputs */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Production Specifications</h2>
            {error && <div className="text-sm font-semibold text-red-600 mt-1 bg-red-50 p-2 rounded border border-red-200">{error}</div>}
          </div>
          <div className="space-x-3">
            <button onClick={handleExportCSV} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition shadow-sm">
              Export CSV
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Cut List Table */}
          <section className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Master Cut List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-3 rounded-tl-lg">Component</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Dim 1 (Length)</th>
                    <th className="p-3 text-right">Dim 2 (Width)</th>
                    <th className="p-3 text-right">Thickness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {cutList.length === 0 && !error && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400 italic">
                        Enter parameters and click "Generate Cut List"
                      </td>
                    </tr>
                  )}
                  {cutList.map((part, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-800">{part.name}</td>
                      <td className="p-3 text-center">{part.qty}</td>
                      <td className="p-3 text-right text-blue-700 font-mono">{part.dim1.toFixed(1)}</td>
                      <td className="p-3 text-right text-blue-700 font-mono">{part.dim2.toFixed(1)}</td>
                      <td className="p-3 text-right font-mono text-blue-700">{part.thick}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {showOnUI && <CabinetFrontView inputs={inputs} />}

          {/* SVG Blueprints */}
          {cutList.length > 0 && (
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Technical Panel Blueprints (Scale: Auto)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cutList.map((part, index) => {
                  const viewSize = 500;
                  const margin = 80;
                  const available = viewSize - margin * 2;

                  const maxDim = Math.max(part.dim1, part.dim2);
                  const scale = available / maxDim;

                  const rectW = part.dim1 * scale;
                  const rectH = part.dim2 * scale;
                  const x = (viewSize - rectW) / 2;
                  const y = (viewSize - rectH) / 2;

                  const hasGroove = part.notes.toLowerCase().includes("groove");

                  return (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col items-center relative group hover:border-blue-400 transition">
                      <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Qty: {part.qty}</div>

                      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" height="auto" className="max-w-xs font-mono" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <marker id={`arrow-start-${index}`} markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto-start-reverse">
                            <path d="M 0 3 L 8 6 L 8 0 Z" fill="#475569" />
                          </marker>
                          <marker id={`arrow-end-${index}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                            <path d="M 0 0 L 8 3 L 0 6 Z" fill="#475569" />
                          </marker>
                        </defs>

                        <rect x={x} y={y} width={rectW} height={rectH} fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />

                        {hasGroove && <rect x={x + 6 * scale} y={y + 6 * scale} width={rectW - 12 * scale} height={rectH - 12 * scale} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6,4" />}

                        <line x1={x} y1={y - 20} x2={x + rectW} y2={y - 20} stroke="#475569" strokeWidth="1" markerStart={`url(#arrow-start-${index})`} markerEnd={`url(#arrow-end-${index})`} />
                        <line x1={x} y1={y} x2={x} y2={y - 25} stroke="#94a3b8" strokeWidth="1" />
                        <line x1={x + rectW} y1={y} x2={x + rectW} y2={y - 25} stroke="#94a3b8" strokeWidth="1" />
                        <text x={x + rectW / 2} y={y - 28} textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">
                          {part.dim1.toFixed(1)} mm
                        </text>

                        <line x1={x + rectW + 20} y1={y} x2={x + rectW + 20} y2={y + rectH} stroke="#475569" strokeWidth="1" markerStart={`url(#arrow-start-${index})`} markerEnd={`url(#arrow-end-${index})`} />
                        <line x1={x + rectW} y1={y} x2={x + rectW + 25} y2={y} stroke="#94a3b8" strokeWidth="1" />
                        <line x1={x + rectW} y1={y + rectH} x2={x + rectW + 25} y2={y + rectH} stroke="#94a3b8" strokeWidth="1" />
                        <g transform={`translate(${x + rectW + 25}, ${y + rectH / 2})`}>
                          <text x="0" y="0" transform="rotate(270)" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">
                            {part.dim2.toFixed(1)} mm
                          </text>
                        </g>

                        <text x={x + rectW / 2} y={y + rectH / 2} textAnchor="middle" fill="#64748b" fontSize="14">
                          T={part.thick}mm
                        </text>
                      </svg>

                      <div className="mt-4 text-center">
                        <h4 className="font-bold text-slate-800 text-sm">{part.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 px-4 leading-tight">{part.notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimpleStorageUnits;
