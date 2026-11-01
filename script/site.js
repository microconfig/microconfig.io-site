// Shared page behaviour: copy buttons for commands and Yandex.Metrika goals for key actions.
// Goals to create in Metrika (type "JavaScript event"): copy_command, cta_quickstart, cta_github, cta_download, demo_edit.

(function () {
    var METRIKA_ID = 62712055;

    document.addEventListener('DOMContentLoaded', function () {
        addCopyButtons();
        trackGoalClicks();
        showCurrentYear();
    });

    function addCopyButtons() {
        document.querySelectorAll('[data-copy]').forEach(function (block) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'copy-button';
            button.textContent = 'Copy';
            button.addEventListener('click', function () {
                copyText(block.getAttribute('data-copy') || block.innerText.trim(), button);
            });
            block.appendChild(button);
        });
    }

    function copyText(text, button) {
        navigator.clipboard.writeText(text).then(function () {
            button.textContent = 'Copied';
            setTimeout(function () { button.textContent = 'Copy'; }, 1500);
        });
        reachGoal('copy_command');
    }

    function trackGoalClicks() {
        document.querySelectorAll('[data-goal]').forEach(function (element) {
            element.addEventListener('click', function () {
                reachGoal(element.getAttribute('data-goal'));
            });
        });
    }

    function showCurrentYear() {
        document.querySelectorAll('[data-year]').forEach(function (element) {
            element.textContent = new Date().getFullYear();
        });
    }

    function reachGoal(goal) {
        if (typeof window.ym === 'function') {
            window.ym(METRIKA_ID, 'reachGoal', goal);
        }
    }

    window.mcReachGoal = reachGoal;
})();
