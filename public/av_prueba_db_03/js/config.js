let veeva = {
   zipName: "av_prueba_db_",
   presentationCode: "00049999",
   slide: "03",
};
// Función para navegar entre slides
function jumptoSlide(slide) {
   const isIpad = /iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

   if (typeof veeva !== "undefined") {
      const zipName = veeva.zipName || "default_";
      const presentationCode = veeva.presentationCode || "000000";
      if (isIpad) {
         document.location = `veeva:gotoSlide(${zipName}${slide}.zip, ${presentationCode})`;
      } else {
         localStorage.getItem("ambiente") === "local"
         ? document.location = `/public/${veeva.zipName}${slide}/${veeva.zipName}${slide}.html`
         : document.location = `/Ejercicio-IndexBD/public/${zipName}${slide}/${zipName}${slide}.html`;
      }
   } else {
      console.error("Error: Configuración de Veeva no encontrada.");
   }
}
document.querySelectorAll(".jumpto-slide").forEach((button) => {
   button.addEventListener("click", (event) => {
      const slide = event.target.getAttribute("data-slide");
      jumptoSlide(slide);
   });
});
