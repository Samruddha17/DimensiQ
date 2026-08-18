# DimensiQ

A React-based Manufacturing CAM (Computer-Aided Manufacturing) tool for generating exact panel cut lists and dimensioned technical blueprints for modular furniture. 

Built with scalability in mind, this engine uses a Strategy Pattern to allow seamless registration of new furniture types without bloating the UI components.

## 🚀 Tech Stack

* **Frontend Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Architecture:** Vanilla JS Strategy Pattern for the core math engine

## 📂 Project Structure

```text
├── src/
│   ├── utils/
│   │   └── engine.js      # Core math, strategy pattern, and validation logic
│   ├── App.jsx            # Main React UI component and SVG rendering
│   ├── main.jsx           # React DOM entry point
│   └── index.css          # Tailwind imports and global styles
├── index.html             # HTML entry point
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts