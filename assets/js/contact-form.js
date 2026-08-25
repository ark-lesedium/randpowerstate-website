/**
 * Contact form handler (mailto fallback)
 *
 * This site is static (GitHub Pages) with no server-side form processor
 * available, so the contact form builds a pre-filled `mailto:` link from
 * the visitor's input and hands off to their email client instead of
 * submitting to a backend. If you later add a form backend (e.g.
 * Formspree, a serverless function), swap this out and point the form's
 * `action` at it instead.
 */
(function () {
  "use strict";

  const RECEIVING_EMAIL = "info@randpowerstate.co.za";

  const form = document.querySelector(".mailto-contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = form.querySelector("[name='name']").value.trim();
    const email = form.querySelector("[name='email']").value.trim();
    const subject = form.querySelector("[name='subject']").value.trim();
    const message = form.querySelector("[name='message']").value.trim();

    const sentMessage = form.querySelector(".sent-message");
    const errorMessage = form.querySelector(".error-message");

    if (!name || !email || !subject || !message) {
      if (errorMessage) {
        errorMessage.textContent = "Please fill in all fields before sending.";
        errorMessage.classList.add("d-block");
      }
      if (sentMessage) sentMessage.classList.remove("d-block");
      return;
    }

    if (errorMessage) errorMessage.classList.remove("d-block");

    const body = `From: ${name} (${email})\n\n${message}`;
    const mailtoLink =
      `mailto:${RECEIVING_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    if (sentMessage) {
      sentMessage.textContent =
        "Your email app should now open with your message pre-filled — just hit send to reach us.";
      sentMessage.classList.add("d-block");
    }
  });
})();
