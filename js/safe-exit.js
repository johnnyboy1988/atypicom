(function () {
  "use strict";

  const EXIT_MESSAGE = "Tem certeza que deseja sair? ";
  let isDirty = true;

  function enableExitProtection() {
    isDirty = true;
  }

  function disableExitProtection() {
    isDirty = false;
  }

  function handleBeforeUnload(event) {
    if (isDirty) {
      // Para navegadores modernos
      event.preventDefault();
      // Para navegadores mais antigos
      event.returnValue = EXIT_MESSAGE;
      return EXIT_MESSAGE;
    }
  }

  function markAsClean() {
    isDirty = false;
  }

  function markAsDirty() {
    isDirty = true;
  }

  function isExitProtectionActive() {
    return isDirty;
  }

  window.addEventListener("beforeunload", handleBeforeUnload);

  document.addEventListener(
    "click",
    function (event) {
      const target = event.target.closest("a");

      if (target) {
        const href = target.getAttribute("href");

        if (href && href.startsWith("#")) {
          return;
        }

        if (href && !href.startsWith("http")) {
          if (target.target === "_blank") {
            return;
          }

          if (target.closest('[data-safe-exit="ignore"]')) {
            disableExitProtection();
            setTimeout(enableExitProtection, 100);
          }
        }
      }
    },
    true,
  );

  document.addEventListener(
    "submit",
    function (event) {
      if (event.target.closest('[data-safe-exit="ignore"]')) {
        disableExitProtection();
        setTimeout(enableExitProtection, 100);
      }
    },
    true,
  );

  window.SafeExit = {
    enable: enableExitProtection,
    disable: disableExitProtection,
    markAsClean: markAsClean,
    markAsDirty: markAsDirty,
    isActive: isExitProtectionActive,
    setDirty: function (value) {
      isDirty = value;
    },
  };
})();
