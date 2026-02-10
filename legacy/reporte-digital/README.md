# 🏗️ MICSA Digital Suite - Documentation for Developers v1.5.0

This documentation provides a comprehensive guide to the **MICSA Digital Work Report System**, its architecture, and how it functions under the hood.

---

## 📂 Arquitectura del Sistema

El sistema MICSA Digital utiliza una arquitectura **Full-Stack** moderna, separando claramente las responsabilidades entre el cliente (Front end) y el servidor (Back end).

### **Front end (Interfaz y Experiencia)**
Es la parte visible con la que interactúas en el navegador.
- **Responsabilidades**: Diseño visual, formularios dinámicos, previsualización de datos, generación de documentos (PDF/Excel) y experiencia de usuario (UX).
- **Archivos**: 
    - `index.html`, `reporte-diario.html`, `packing-list.html` (Estructura)
    - `styles.css` (Estilos y Diseño Premium)
    - `script.js`, `packing-list.js`, `pdf-logic.js` (Interactividad y lógica de usuario)

### **Back end (Lógica y Datos)**
Gestiona el procesamiento "detrás de escena" y la persistencia de la información.
- **Responsabilidades**: Gestión de la base de datos SQLite, procesamiento de solicitudes API, seguridad de datos y lógica de persistencia.
- **Archivos**:
    - `backend/index.js` (Servidor Express, gestión de rutas/API)
    - `backend/database.js` (Conexión y comandos SQL para SQLite)
    - `backend/database/micsa.db` (Base de Datos persistente)

---

## 🛠️ Tecnologías Utilizadas

| Parte | Tecnologías |
| :--- | :--- |
| **Front end** | HTML5, CSS3 (Vanilla), JavaScript (ES6+), SheetJS, jsPDF |
| **Back end** | Node.js, Express.js, SQLite3 |

---

---

## ⚙️ How it Works

### 1. Data Persistence (localStorage)
The system uses the browser's `localStorage` as a key-value database. 

*   **Borradores (Drafts)**: Saved with keys following the pattern `MICSA_Reporte_Borrador_[RepoNo]`.
*   **Active Session**: The key `MICSA_Ultimo_Reporte_No_Actual` stores which report is currently being edited.
*   **Automatic Save**: `script.js` runs a `setInterval` every 120,000ms (2 minutes) to snapshot the current state.

### 2. Multi-Report Support
Unlike basic forms, this system supports multiple independent reports.
*   The `getDraftKey()` function in `script.js` dynamically generates a storage key based on the value of the "Reporte No." input field.
*   When a user changes the report number, a `change` event listener resets the form and attempts to load data specifically for that new number.

### 3. Modular PDF Logic (`pdf-logic.js`)
To keep the main logic file clean, PDF generation is decoupled.
*   **`generarPDF()`**: This function is triggered by the UI. 
*   **DOM Preparation**: It adds a `.printing` class to the body and ensures navigation elements (buttons, sidebars) are hidden via the `.no-print` utility class and aggressive CSS overrides in `@media print`.

### 4. Dynamic UI Updates
*   **Dynamic Rows**: Functions like `addPersonalRow()` inject HTML templates into table bodies and trigger CSS animations for a premium feel.
*   **Reactive Fields**: Input listeners on fields like "Ubicación / Cliente" use JavaScript to update unrelated DOM elements (e.g., the signature labels at the bottom) in real-time.

---

## 🛠️ Developmental Guidelines

### Adding New Sections to the Report
1.  Add the HTML structure to `reporte-diario.html`.
2.  Assign a unique `id` to all interactive inputs.
3.  The `guardarBorrador()` function automatically scans the entire form for inputs, selects, and textareas, so no JS changes are needed for basic fields.
4.  If adding a new dynamic table, update `getTableData()` and `restoreTableData()` to include the new table ID.

### Improving PDF Design
Modify the `@media print` block at the end of `styles.css`. This block overrides almost all visual styles to ensure readability and ink conservation on paper.

### Local Development
To run the project locally with full browser feature support:
```bash
npm install serve
npm start
```
This serves the project on `http://localhost:3000`.

---

## 📄 License
MICSA Internal Proprietary Software. Distributed under ISC License.
Developed for Advanced Digital Management of Industrial Construction Projects.
