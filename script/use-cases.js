// Role filter on the use cases page: shows only the use cases (and their table of contents links) for one team.

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var filter = document.querySelector('[data-role-filter]');
        if (!filter) return;
        filter.querySelectorAll('button[data-role]').forEach(function (button) {
            button.addEventListener('click', function () {
                select(filter, button);
                showRole(button.getAttribute('data-role'));
            });
        });
    });

    function select(filter, active) {
        filter.querySelectorAll('button[data-role]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button === active));
        });
    }

    function showRole(role) {
        document.querySelectorAll('.use-case[data-roles]').forEach(function (useCase) {
            var visible = role === 'all' || useCase.getAttribute('data-roles').split(' ').indexOf(role) >= 0;
            useCase.hidden = !visible;
            var link = document.querySelector('.uc-toc a[href="#' + useCase.id + '"]');
            if (link) link.hidden = !visible;
        });
    }
})();
