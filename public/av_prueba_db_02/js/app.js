document.addEventListener("DOMContentLoaded", () => {
   let db;
   let editingId = null;

   const gradoInput = document.getElementById("grado");
   const salonInput = document.getElementById("salon");
   const addButton = document.getElementById("add-course");
   const saveButton = document.getElementById("save-changes");
   const cancelButton = document.getElementById("cancel-edit");
   const tableBody = document.getElementById("course-table");

   // Initialize IndexedDB
   function initDB() {
      const request = indexedDB.open("SchoolDB", 1);

      request.onupgradeneeded = (event) => {
         db = event.target.result;
         if (!db.objectStoreNames.contains("cursos")) {
            db.createObjectStore("cursos", { keyPath: "id", autoIncrement: true });
         }
         alert("Base de datos actualizada o creada.");
      };

      request.onsuccess = (event) => {
         db = event.target.result;
         listCourses();
         alert("Base de datos inicializada con éxito.");
      };

      request.onerror = (event) => {
         alert("Error al abrir la base de datos: " + event.target.error);
      };
   }

   // Add course
   function addCourse() {
      const grado = gradoInput.value.trim();
      const salon = salonInput.value.trim();

      if (!grado || !salon) {
         alert("Por favor completa todos los campos.");
         return;
      }

      const transaction = db.transaction("cursos", "readwrite");
      const store = transaction.objectStore("cursos");

      store.add({ grado, salon }).onsuccess = () => {
         gradoInput.value = "";
         salonInput.value = "";
         listCourses();
         alert("Curso agregado con éxito.");
      };

      transaction.onerror = (event) => {
         alert("Error al agregar curso: " + event.target.error);
      };
   }

   // List courses
   function listCourses() {
      const transaction = db.transaction("cursos", "readonly");
      const store = transaction.objectStore("cursos");
      const request = store.getAll();

      request.onsuccess = () => {
         const courses = request.result;
         tableBody.innerHTML = "";

         if (courses.length === 0) {
            alert("No hay cursos disponibles.");
         }

         courses.forEach((course) => {
            const row = document.createElement("tr");
            row.className = "border border-gray-300";
            row.innerHTML = `
               <td class="border border-gray-300 p-2 text-center">${course.id}</td>
               <td class="border border-gray-300 p-2 text-center">${course.grado}</td>
               <td class="border border-gray-300 p-2 text-center">${course.salon}</td>
               <td class="border border-gray-300 p-2 text-center">
                  <button class="edit-btn bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600" data-id="${course.id}">Editar</button>
                  <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600" data-id="${course.id}">Eliminar</button>
               </td>
               `;
            tableBody.appendChild(row);
         });

         // Add event listeners for edit and delete buttons
         document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", () => editCourse(button.dataset.id));
         });

         document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", () => deleteCourse(button.dataset.id));
         });
      };

      request.onerror = (event) => {
         alert("Error al listar los cursos: " + event.target.error);
      };
   }

   // Edit course
   function editCourse(id) {
      const transaction = db.transaction("cursos", "readonly");
      const store = transaction.objectStore("cursos");

      store.get(Number(id)).onsuccess = (event) => {
         const course = event.target.result;
         editingId = course.id;
         gradoInput.value = course.grado;
         salonInput.value = course.salon;
         toggleEditMode(true);
         alert("Curso cargado para editar.");
      };

      store.get(Number(id)).onerror = (event) => {
         alert("Error al cargar el curso: " + event.target.error);
      };
   }

   // Save changes
   function saveChanges() {
      const grado = gradoInput.value.trim();
      const salon = salonInput.value.trim();

      if (!grado || !salon) {
         alert("Por favor completa todos los campos.");
         return;
      }

      const transaction = db.transaction("cursos", "readwrite");
      const store = transaction.objectStore("cursos");

      store.put({ id: editingId, grado, salon }).onsuccess = () => {
         editingId = null;
         gradoInput.value = "";
         salonInput.value = "";
         toggleEditMode(false);
         listCourses();
         alert("Cambios guardados con éxito.");
      };

      transaction.onerror = (event) => {
         alert("Error al guardar cambios: " + event.target.error);
      };
   }

   // Delete course
   function deleteCourse(id) {
      if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
         const transaction = db.transaction("cursos", "readwrite");
         const store = transaction.objectStore("cursos");

         store.delete(Number(id)).onsuccess = () => {
            listCourses();
            alert("Curso eliminado con éxito.");
         };

         transaction.onerror = (event) => {
            alert("Error al eliminar curso: " + event.target.error);
         };
      }
   }

   // Toggle edit mode
   function toggleEditMode(isEditing) {
      addButton.classList.toggle("hidden", isEditing);
      saveButton.classList.toggle("hidden", !isEditing);
      cancelButton.classList.toggle("hidden", !isEditing);
   }

   // Event listeners
   addButton.addEventListener("click", addCourse);
   saveButton.addEventListener("click", saveChanges);
   cancelButton.addEventListener("click", () => {
      editingId = null;
      gradoInput.value = "";
      salonInput.value = "";
      toggleEditMode(false);
      alert("Edición cancelada.");
   });

   // Initialize the app
   initDB();
});
