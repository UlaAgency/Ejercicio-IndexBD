document.addEventListener("DOMContentLoaded", () => {
   let db;
   const tablaPersonas = document.getElementById("tablaPersonas");
   const numeroDocumento = document.getElementById("numeroDocumento");
   const nombre = document.getElementById("nombre");
   const sexo = document.getElementById("sexo");
   const telefono = document.getElementById("telefono");
   const rol = document.getElementById("rol");
   const btnAgregar = document.getElementById("btnAgregar");
   const btnGuardar = document.getElementById("btnGuardar");
   const btnCancelar = document.getElementById("btnCancelar");
   let personaEnEdicion = null;

   // Inicializar la base de datos IndexedDB
   function initDB() {
      const request = indexedDB.open("SchoolDB", 1);

      request.onupgradeneeded = (event) => {
         db = event.target.result;
         if (!db.objectStoreNames.contains("personas")) {
            db.createObjectStore("personas", { keyPath: "id", autoIncrement: true });
         }
         alert("Base de datos actualizada o creada.");
      };

      request.onsuccess = (event) => {
         db = event.target.result;
         listarPersonas();
         alert("Base de datos inicializada con éxito.");
      };

      request.onerror = (event) => {
         alert("Error al inicializar la base de datos.");
         alert("IndexedDB error:", event.target.error);
      };
   }

   // Listar personas en la tabla
   function listarPersonas() {
      const transaction = db.transaction("personas", "readonly");
      const store = transaction.objectStore("personas");
      const request = store.getAll();

      request.onsuccess = () => {
         const personas = request.result;
         tablaPersonas.innerHTML = personas
            .map((persona) => `
               <tr>
                  <td class="border border-gray-300 p-2 text-center">${persona.id}</td>
                  <td class="border border-gray-300 p-2 text-center">${persona.numeroDocumento}</td>
                  <td class="border border-gray-300 p-2 text-center">${persona.nombre}</td>
                  <td class="border border-gray-300 p-2 text-center">${persona.sexo}</td>
                  <td class="border border-gray-300 p-2 text-center">${persona.telefono}</td>
                  <td class="border border-gray-300 p-2 text-center">${persona.rol}</td>
                  <td class="border border-gray-300 p-2 text-center">
                     <button class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600" onclick="editarPersona(${persona.id})">Editar</button>
                     <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600" onclick="eliminarPersona(${persona.id})">Eliminar</button>
                  </td>
               </tr>
            `).join("");
         alert("Personas listadas:", personas);
      };

      request.onerror = () => {
         alert("Error al listar personas.");
         alert("Error al obtener personas.");
      };
   }

   // Agregar una nueva persona
   function agregarPersona() {
      if (!numeroDocumento.value || !nombre.value || !sexo.value || !telefono.value || !rol.value) {
         alert("Por favor, completa todos los campos.");
         return;
      }

      const transaction = db.transaction("personas", "readwrite");
      const store = transaction.objectStore("personas");

      store.add({
         numeroDocumento: numeroDocumento.value,
         nombre: nombre.value,
         sexo: sexo.value,
         telefono: telefono.value,
         rol: rol.value,
      }).onsuccess = () => {
         limpiarFormulario();
         listarPersonas();
         alert("Persona agregada con éxito.");
      };

      transaction.onerror = () => {
         alert("Error al agregar persona.");
         alert("Error al guardar persona.");
      };
   }

   // Editar persona
   window.editarPersona = function (id) {
      const transaction = db.transaction("personas", "readonly");
      const store = transaction.objectStore("personas");
      const request = store.get(id);

      request.onsuccess = () => {
         const persona = request.result;
         personaEnEdicion = persona.id;
         numeroDocumento.value = persona.numeroDocumento;
         nombre.value = persona.nombre;
         sexo.value = persona.sexo;
         telefono.value = persona.telefono;
         rol.value = persona.rol;
         btnAgregar.classList.add("hidden");
         btnGuardar.classList.remove("hidden");
         btnCancelar.classList.remove("hidden");
         alert("Persona cargada para edición:", persona);
      };

      request.onerror = () => {
         alert("Error al cargar persona para editar.");
         alert("Error al obtener persona.");
      };
   };

   // Guardar cambios en persona editada
   btnGuardar.addEventListener("click", () => {
      if (!numeroDocumento.value || !nombre.value || !sexo.value || !telefono.value || !rol.value) {
         alert("Por favor, completa todos los campos.");
         return;
      }

      const transaction = db.transaction("personas", "readwrite");
      const store = transaction.objectStore("personas");

      const personaActualizada = {
         id: personaEnEdicion,
         numeroDocumento: numeroDocumento.value,
         nombre: nombre.value,
         sexo: sexo.value,
         telefono: telefono.value,
         rol: rol.value,
      };

      store.put(personaActualizada).onsuccess = () => {
         limpiarFormulario();
         listarPersonas();
         btnAgregar.classList.remove("hidden");
         btnGuardar.classList.add("hidden");
         btnCancelar.classList.add("hidden");
         personaEnEdicion = null;
         alert("Persona actualizada con éxito:", personaActualizada);
      };

      transaction.onerror = () => {
         alert("Error al guardar los cambios.");
         alert("Error al actualizar persona.");
      };
   });

   // Cancelar edición
   btnCancelar.addEventListener("click", () => {
      limpiarFormulario();
      btnAgregar.classList.remove("hidden");
      btnGuardar.classList.add("hidden");
      btnCancelar.classList.add("hidden");
      personaEnEdicion = null;
      alert("Edición cancelada.");
   });

   // Eliminar persona
   window.eliminarPersona = function (id) {
      if (!confirm("¿Estás seguro de que deseas eliminar esta persona?")) return;

      const transaction = db.transaction("personas", "readwrite");
      const store = transaction.objectStore("personas");

      store.delete(id).onsuccess = () => {
         listarPersonas();
         alert(`Persona con ID ${id} eliminada con éxito.`);
      };

      transaction.onerror = () => {
         alert("Error al eliminar persona.");
         alert("Error al eliminar persona.");
      };
   };

   // Limpiar formulario
   function limpiarFormulario() {
      numeroDocumento.value = "";
      nombre.value = "";
      sexo.value = "";
      telefono.value = "";
      rol.value = "";
      alert("Formulario limpiado.");
   }

   // Inicialización
   initDB();
   btnAgregar.addEventListener("click", agregarPersona);
});
