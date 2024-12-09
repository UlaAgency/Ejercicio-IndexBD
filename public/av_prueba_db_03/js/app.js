let db;
let editingId = null;
let maestros = [];

// Inicializar IndexedDB
function initDB() {
   const request = indexedDB.open("SchoolDB", 1);

   request.onupgradeneeded = (event) => {
      alert("Actualizando base de datos...");
      db = event.target.result;

      if (!db.objectStoreNames.contains("asignaturas")) {
         db.createObjectStore("asignaturas", { keyPath: "id", autoIncrement: true });
         alert("Tienda de objetos 'asignaturas' creada.");
      }

      if (!db.objectStoreNames.contains("personas")) {
         db.createObjectStore("personas", { keyPath: "id", autoIncrement: true });
         alert("Tienda de objetos 'personas' creada.");
      }
   };

   request.onsuccess = (event) => {
      db = event.target.result;
      alert("Base de datos inicializada correctamente.");
      listMaestros();
      listAsignaturas();
   };

   request.onerror = (event) => {
      alert("Error al inicializar la base de datos: " + event.target.error);
   };
}

// Listar maestros
function listMaestros() {
   const transaction = db.transaction("personas", "readonly");
   const store = transaction.objectStore("personas");

   store.getAll().onsuccess = (event) => {
      maestros = event.target.result.filter(persona => persona.rol === "Maestro");
      alert(`Maestros cargados: ${JSON.stringify(maestros)}`);
      populateMaestroSelect();
   };

   store.getAll().onerror = () => {
      alert("Error al cargar los maestros.");
   };
}

// Poblar el select de maestros
function populateMaestroSelect() {
   const select = document.getElementById("maestro");
   select.innerHTML = '<option value="">Seleccione un maestro</option>'; // Limpiar y añadir opción inicial
   maestros.forEach(maestro => {
      const option = document.createElement("option");
      option.value = maestro.id;
      option.textContent = maestro.nombre;
      select.appendChild(option);
   });
   alert("Select de maestros poblado.");
}

// Listar asignaturas
function listAsignaturas() {
   const transaction = db.transaction("asignaturas", "readonly");
   const store = transaction.objectStore("asignaturas");

   store.getAll().onsuccess = (event) => {
      const asignaturas = event.target.result;
      alert(`Asignaturas cargadas: ${JSON.stringify(asignaturas)}`);
      renderAsignaturas(asignaturas);
   };

   store.getAll().onerror = () => {
      alert("Error al cargar las asignaturas.");
   };
}

// Renderizar las asignaturas en la tabla
function renderAsignaturas(asignaturas) {
   const tableBody = document.getElementById("table-body");
   tableBody.innerHTML = "";

   asignaturas.forEach(asignatura => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td class="border border-gray-300 p-2 text-center">${asignatura.codigo}</td>
            <td class="border border-gray-300 p-2 text-center">${asignatura.nombre}</td>
            <td class="border border-gray-300 p-2 text-center">${getMaestroName(asignatura.maestro.id)}</td>
            <td class="border border-gray-300 p-2 text-center">
               <button onclick="editAsignatura(${asignatura.id})" class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600">Editar</button>
               <button onclick="deleteAsignatura(${asignatura.id})" class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Eliminar</button>
            </td>
         `;
      tableBody.appendChild(row);
   });
   alert("Tabla de asignaturas actualizada.");
}

// Obtener el nombre del maestro
function getMaestroName(id) {
   const maestro = maestros.find(m => m.id === parseInt(id));
   return maestro ? maestro.nombre : 'Desconocido';
}

// Agregar asignatura
function addAsignatura() {
   const codigo = document.getElementById("codigo").value.trim();
   const nombre = document.getElementById("nombre").value.trim();
   const maestroId = document.getElementById("maestro").value;

   if (!codigo || !nombre || !maestroId) {
      alert("Por favor completa todos los campos.");
      return;
   }

   const transaction = db.transaction("asignaturas", "readwrite");
   const store = transaction.objectStore("asignaturas");

   const asignatura = { codigo, nombre, maestro: { id: maestroId } };

   store.add(asignatura).onsuccess = () => {
      alert("Asignatura agregada correctamente.");
      document.getElementById("codigo").value = "";
      document.getElementById("nombre").value = "";
      document.getElementById("maestro").value = "";
      listAsignaturas();
   };

   store.add(asignatura).onerror = () => {
      alert("Error al agregar la asignatura.");
   };
}

// Editar asignatura
function editAsignatura(id) {
   const transaction = db.transaction("asignaturas", "readonly");
   const store = transaction.objectStore("asignaturas");

   store.get(id).onsuccess = (event) => {
      const asignatura = event.target.result;
      editingId = asignatura.id;
      document.getElementById("codigo").value = asignatura.codigo;
      document.getElementById("nombre").value = asignatura.nombre;
      document.getElementById("maestro").value = asignatura.maestro.id;

      document.getElementById("add-asignatura").classList.add("hidden");
      document.getElementById("save-changes").classList.remove("hidden");
      document.getElementById("cancel-edit").classList.remove("hidden");
      alert("Editando asignatura: " + JSON.stringify(asignatura));
   };

   store.get(id).onerror = () => {
      alert("Error al cargar la asignatura para edición.");
   };
}

// Guardar cambios
function saveChanges() {
   const codigo = document.getElementById("codigo").value.trim();
   const nombre = document.getElementById("nombre").value.trim();
   const maestroId = document.getElementById("maestro").value;

   if (!codigo || !nombre || !maestroId) {
      alert("Por favor completa todos los campos.");
      return;
   }

   const transaction = db.transaction("asignaturas", "readwrite");
   const store = transaction.objectStore("asignaturas");

   const asignatura = { id: editingId, codigo, nombre, maestro: { id: maestroId } };

   store.put(asignatura).onsuccess = () => {
      alert("Cambios guardados correctamente.");
      cancelEdit();
      listAsignaturas();
   };

   store.put(asignatura).onerror = () => {
      alert("Error al guardar los cambios.");
   };
}

// Cancelar edición
function cancelEdit() {
   editingId = null;
   document.getElementById("codigo").value = "";
   document.getElementById("nombre").value = "";
   document.getElementById("maestro").value = "";

   document.getElementById("add-asignatura").classList.remove("hidden");
   document.getElementById("save-changes").classList.add("hidden");
   document.getElementById("cancel-edit").classList.add("hidden");
   alert("Edición cancelada.");
}

// Eliminar asignatura
function deleteAsignatura(id) {
   if (confirm("¿Estás seguro de eliminar esta asignatura?")) {
      const transaction = db.transaction("asignaturas", "readwrite");
      const store = transaction.objectStore("asignaturas");

      store.delete(id).onsuccess = () => {
         alert("Asignatura eliminada correctamente.");
         listAsignaturas();
      };

      store.delete(id).onerror = () => {
         alert("Error al eliminar la asignatura.");
      };
   }
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
   initDB();

   document.getElementById("add-asignatura").addEventListener("click", addAsignatura);
   document.getElementById("save-changes").addEventListener("click", saveChanges);
   document.getElementById("cancel-edit").addEventListener("click", cancelEdit);
});
