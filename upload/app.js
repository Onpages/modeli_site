// === CLEAN FRAMEWORK: storiesdock handler ===

document.addEventListener('DOMContentLoaded', function () {
  var dockLinks = document.querySelectorAll('.stories a.story[href^="#"]');

  dockLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);

      if (!target) {
        var nameEl = a.querySelector('b');
        var name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';

        if (name) {
          var cards = Array.prototype.slice.call(document.querySelectorAll('.ig-card h3'));
          var found = cards.find(function (x) {
            return x.textContent.trim().toLowerCase().indexOf(name) === 0;
          });

          if (found) {
            target = found.closest('.ig-card');
          }
        }
      }

      if (!target) {
        return;
      }

      e.preventDefault();

      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });

      history.replaceState(null, '', '#' + id);
    });
  });
});