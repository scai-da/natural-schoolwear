// Sends waitlist and contact forms without leaving the page.
// Without JavaScript the forms still work: Formspree redirects to /thanks/.
(function () {
  // Contact page: preselect the topic from ?topic=school and show the school field when relevant.
  var topic = document.getElementById("c-topic");
  if (topic) {
    var params = new URLSearchParams(location.search);
    if (params.get("topic") === "school") topic.value = "School information pack";
    var dependents = document.querySelectorAll("[data-show-for]");
    var sync = function () {
      dependents.forEach(function (el) { el.hidden = el.getAttribute("data-show-for") !== topic.value; });
    };
    topic.addEventListener("change", sync);
    sync();
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form__status");
      var button = form.querySelector('button[type="submit"]');
      var label = button.textContent;
      var kind = form.getAttribute("data-form");

      var say = function (msg, state) {
        status.textContent = msg;
        status.setAttribute("data-state", state);
      };

      if (/YOUR_.*FORM_ID/.test(form.action)) {
        say("This form isn't connected yet. Add your Formspree form ID in site.config.mjs.", "error");
        return;
      }

      button.disabled = true;
      button.textContent = kind === "contact" ? "Sending…" : "Joining…";
      say("", "");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say(
              kind === "contact"
                ? "Message sent. We'll reply within two business days."
                : "You're on the list. We'll email you when uniforms are ready to order.",
              "ok"
            );
          } else {
            return res.json().then(function (data) {
              var detail = data && data.errors ? data.errors.map(function (x) { return x.message; }).join(" ") : "";
              say((detail || "Your details didn't go through.") + " Check your email address and try again.", "error");
            });
          }
        })
        .catch(function () {
          say("Your details didn't go through because the connection dropped. Check you're online and try again.", "error");
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = label;
        });
    });
  });
})();
