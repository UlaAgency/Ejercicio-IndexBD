const app = {
   db: null,
   cursos: [],
   maestros: [],
   asignaturas: [],
   asignaciones: [],

   // Inicializar la base de datos
   initDB() {
      const request = indexedDB.open("SchoolDB", 1);

      request.onupgradeneeded = (event) => {
         this.db = event.target.result;

         if (!this.db.objectStoreNames.contains("cursos")) {
            this.db.createObjectStore("cursos", { keyPath: "id", autoIncrement: true });
         }
         if (!this.db.objectStoreNames.contains("personas")) {
            this.db.createObjectStore("personas", { keyPath: "id", autoIncrement: true });
         }
         if (!this.db.objectStoreNames.contains("asignaturas")) {
            this.db.createObjectStore("asignaturas", { keyPath: "id", autoIncrement: true });
         }
         if (!this.db.objectStoreNames.contains("asignaciones")) {
            this.db.createObjectStore("asignaciones", { keyPath: "id", autoIncrement: true });
         }
         alert("Base de datos inicializada o actualizada.");
      };

      request.onsuccess = (event) => {
         this.db = event.target.result;
         this.loadData();
         alert("Base de datos cargada exitosamente.");
      };

      request.onerror = (event) => {
         alert("Error al inicializar la base de datos: " + event.target.error);
      };
   },

   // Cargar datos iniciales
   loadData() {
      this.fetchData("cursos", (data) => {
         this.cursos = data;
         this.populateSelect("curso", data, "salon")
      });
      this.fetchData("asignaturas", (data) => {
         this.asignaturas = data;
         this.populateSelect("asignatura", data, "nombre")
      });
      this.fetchData("personas", (data) => {
         this.maestros = data.filter((p) => p.rol === "Maestro")
      });
      this.fetchData("asignaciones", (data) => {
         this.renderAssignments(data)
      });
   },

   // Obtener datos de una tienda
   fetchData(storeName, callback) {
      const transaction = this.db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      store.getAll().onsuccess = (event) => {
         callback(event.target.result);
      };

      store.getAll().onerror = (event) => {
         alert("Error al obtener datos de " + storeName);
      };
   },

   // Poblar selects
   populateSelect(elementId, data, textKey) {
      const select = document.getElementById(elementId);
      select.innerHTML = '<option value="">Seleccione una opción</option>';
      data.forEach((item) => {
         const option = document.createElement("option");
         option.value = item.id;
         option.textContent = item[textKey];
         select.appendChild(option);
      });
   },

   // Renderizar la tabla de asignaciones
   renderAssignments(assignments) {
      const tableBody = document.getElementById("assignments-table-body");
      tableBody.innerHTML = "";

      assignments.forEach((assignment) => {
         const row = document.createElement("tr");
         row.innerHTML = `
            <td class="border border-gray-300 p-2 text-center">${this.getCursoName(assignment.cursoId)}</td>
            <td class="border border-gray-300 p-2 text-center">${this.getAsignaturaName(assignment.asignaturaId)}</td>
            <td class="border border-gray-300 p-2 text-center">${this.getMaestroName(assignment.asignaturaId)}</td>
            <td class="border border-gray-300 p-2 text-center">
               <button onclick="app.deleteAssignment(${assignment.id})" class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">Eliminar</button>
            </td>`;
         tableBody.appendChild(row);
      });
   },

   // Obtener nombres relacionados
   getCursoName(id) {
      const curso = this.cursos.find((c) => c.id === parseInt(id));
      return curso ? curso.salon : "Desconocido";
   },

   getAsignaturaName(id) {
      const asignatura = this.asignaturas.find((a) => a.id === parseInt(id));
      return asignatura ? asignatura.nombre : "Desconocido";
   },

   getMaestroName(asignaturaId) {
      console.log(asignaturaId);
      console.log(this.asignaturas);
      console.log(this.maestros);
      const asignatura = this.asignaturas.find((a) => a.id === asignaturaId);
      console.log(asignatura);
      const maestro = this.maestros.find((m) => m.id === parseInt(asignatura.maestro.id));
      return maestro ? maestro.nombre : "Desconocido";
   },

   // Asignar asignatura
   assignAsignatura() {
      const cursoId = parseInt(document.getElementById("curso").value);
      const asignaturaId = parseInt(document.getElementById("asignatura").value);

      if (!cursoId || !asignaturaId) {
         alert("Selecciona un curso y una asignatura.");
         return;
      }

      const transaction = this.db.transaction("asignaciones", "readwrite");
      const store = transaction.objectStore("asignaciones");

      const newAssignment = { cursoId, asignaturaId };

      store.add(newAssignment).onsuccess = () => {
         alert("Asignatura asignada correctamente.");
         this.loadData();
      };
   },

   // Eliminar asignación
   deleteAssignment(id) {
      if (confirm("¿Estás seguro de eliminar esta asignación?")) {
         const transaction = this.db.transaction("asignaciones", "readwrite");
         const store = transaction.objectStore("asignaciones");

         store.delete(id).onsuccess = () => {
            alert("Asignación eliminada.");
            this.loadData();
         };
      }
   },
};

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
   app.initDB();
   document.getElementById("assign-button").addEventListener("click", () => app.assignAsignatura());
});
