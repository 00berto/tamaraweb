document.addEventListener("DOMContentLoaded", function () {
  // --- 1. CONFIGURACIÓN INICIAL Y CACHÉ DE ELEMENTOS ---
  // Obtener elementos DOM una sola vez para mejorar el rendimiento
  const mainNav = document.getElementById("mainNav");
  const header = document.querySelector("header");
  const contactForm = document.getElementById("contactForm");
  const formMessages = document.getElementById("formMessages");
  const submitButton = contactForm
    ? contactForm.querySelector('button[type="submit"]')
    : null;
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  // --- 2. FUNCIONALIDAD: SCROLL SUAVE PARA ENLACES DE NAVEGACIÓN ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault(); // Previene el comportamiento de anclaje por defecto

      const targetId = this.getAttribute("href");
      console.log("Smooth Scroll: Clicked link href:", targetId); // Debugging

      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        console.log("Smooth Scroll: Target element found:", targetElement); // Debugging

        if (targetElement) {
          // Calcula el offset para la cabecera fija
          const headerOffset = header ? header.offsetHeight : 0;
          console.log("Smooth Scroll: Header offset:", headerOffset); // Debugging

          const elementPosition =
            targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;
          console.log("Smooth Scroll: Calculated scroll to position:", offsetPosition); // Debugging

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Colapsar la navbar en móviles después de hacer clic en un enlace
          if (
            navbarToggler &&
            navbarCollapse &&
            navbarCollapse.classList.contains("show")
          ) {
            navbarToggler.click(); // Simula un clic para colapsar
          }
        } else {
          console.warn(
            "Smooth Scroll: Target element not found for ID:",
            targetId
          );
        }
      }
    });
  });

  // --- 3. FUNCIONALIDAD: ENVÍO DE FORMULARIO AJAX ---
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Previene el envío de formulario por defecto

      // Resetear mensajes previos y estilos de validación
      formMessages.innerHTML = "";
      formMessages.className = "mt-4 text-center"; // Limpia clases de éxito/error previas
      contactForm.classList.remove("was-validated");

      // Validación de formulario Bootstrap
      if (!contactForm.checkValidity()) {
        event.stopPropagation(); // Detiene la propagación del evento si la validación falla
        contactForm.classList.add("was-validated"); // Añade clase para mostrar feedback de validación
        return; // Detener la ejecución si el formulario no es válido
      }

      // Deshabilitar el botón de envío y cambiar su texto
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
      }

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          // Verificar si la respuesta es JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          } else {
            // Si no es JSON, hubo un error grave en el PHP
            console.error(
              "AJAX Form: Respuesta no JSON:",
              response.status,
              response.statusText
            );
            return response.text().then((text) => {
              console.error(
                "AJAX Form: Contenido de la respuesta (no JSON):",
                text
              );
              throw new Error(
                "Formato de respuesta inesperado del servidor. Código: " +
                  response.status
              );
            });
          }
        })
        .then((data) => {
          if (data.status === "success") {
            // Redirigir a la página de gracias en caso de éxito
            window.location.href = "/src/page/gracias.html";
          } else {
            // Mostrar mensaje de error del servidor en #formMessages
            formMessages.innerHTML =
              '<div class="alert alert-danger">' +
              (data.message ||
                "Ocurrió un error inesperado. Inténtalo de nuevo.") +
              "</div>";
            formMessages.className = "mt-4 text-center error";

            // Re-habilitar el botón y restaurar su texto
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = "Enviar Mensaje";
            }
          }
        })
        .catch((error) => {
          console.error("AJAX Form: Error en la solicitud Fetch:", error);
          formMessages.innerHTML =
            '<div class="alert alert-danger">Hubo un problema. Por favor, inténtalo de nuevo más tarde o contáctame directamente.</div>';
          formMessages.className = "mt-4 text-center error";

          // Re-habilitar el botón y restaurar su texto
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Enviar Mensaje";
          }
        });
    });
  }

  // --- 4. FUNCIONALIDAD: ANIMACIONES EN SCROLL CON INTERSECTION OBSERVER ---
  const animateOnScrollElements =
    document.querySelectorAll(".animate-on-scroll");

  // Opciones para el Intersection Observer
  const observerOptions = {
    root: null, // Observa el viewport
    rootMargin: "0px", // Margen alrededor del viewport
    threshold: 0.1, // % del elemento visible para activar la animación
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const animationClass = target.dataset.animation; // Obtiene la animación del atributo data-animation
        const animationDelay = target.dataset.delay; // Obtiene el delay del atributo data-delay

        if (animationClass) {
          target.classList.add(
            "animate__animated",
            `animate__${animationClass}`
          );
          // Añade el delay si existe
          if (animationDelay) {
            target.style.setProperty("--animate-delay", animationDelay);
          }
          // Si Animate.css tiene una duración específica por defecto que quieres sobreescribir
          // target.style.setProperty('--animate-duration', '1s'); // Ejemplo para forzar duración

          observer.unobserve(target); // Deja de observar el elemento una vez animado
        }
      }
    });
  }, observerOptions);

  // Observa todos los elementos con la clase 'animate-on-scroll'
  animateOnScrollElements.forEach((element) => {
    observer.observe(element);
  });

  // --- 5. OTRAS INICIALIZACIONES (si las necesitas) ---
  // Por ejemplo, para Bootstrap Scrollspy, aunque tu JS maneja el scroll manual
  // Puedes tener Bootstrap's scrollspy para las clases 'active' en la navbar si lo deseas.
  // Ya tienes los atributos `data-bs-spy="scroll"` y `data-bs-target="#mainNav"` en el <body>.
  // Esto hará que Bootstrap se encargue de añadir la clase 'active' a los nav-link.
});
