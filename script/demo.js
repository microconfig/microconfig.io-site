// "Change it once" demo on the landing page.
// Outputs are modelled on a real `microconfig -e dev|prod` build of microconfig-quickstart, trimmed so every
// changed line fits on one line of the result panel.
// The result panel always lists the same watched lines of every generated file and reserves their worst-case
// height up front, so editing never makes the layout jump: only colours and values change.

(function () {
    var DEFAULTS = {
        endpoints: 'health, prometheus',
        context: '/api',
        prodDbHost: '20.20.20.20'
    };

    var PRESETS = {
        metrics: { endpoints: 'health, prometheus, metrics' },
        apiV2: { context: '/api/v2' },
        newDb: { prodDbHost: '30.30.30.30' }
    };

    var OUTPUTS = [
        { id: 'backend-dev', file: 'payment-backend/application.yaml', env: 'dev', build: function (v) { return backend(v, '10', '10.10.10.10'); } },
        { id: 'backend-prod', file: 'payment-backend/application.yaml', env: 'prod', build: function (v) { return backend(v, '50', v.prodDbHost); } },
        { id: 'frontend-dev', file: 'payment-frontend/application.yaml', env: 'dev', build: frontend },
        { id: 'frontend-prod', file: 'payment-frontend/application.yaml', env: 'prod', build: frontend }
    ];

    var previous = {};
    var reservedHeights = {};
    var edited = false;

    document.addEventListener('DOMContentLoaded', function () {
        var demo = document.getElementById('demo');
        if (!demo) return;
        bindInputs(demo);
        bindPresets(demo);
        bindFullFilesToggle(demo);
        reserveResultHeights(demo);
        render(demo);
        window.addEventListener('resize', debounce(function () {
            reserveResultHeights(demo);
            render(demo);
        }, 150));
    });

    function bindInputs(demo) {
        demo.querySelectorAll('input[data-field]').forEach(function (input) {
            input.value = DEFAULTS[input.getAttribute('data-field')];
            input.addEventListener('input', function () {
                onEdit(demo);
            });
        });
    }

    function bindPresets(demo) {
        demo.querySelectorAll('[data-preset]').forEach(function (button) {
            button.addEventListener('click', function () {
                applyPreset(demo, PRESETS[button.getAttribute('data-preset')]);
                onEdit(demo);
            });
        });
        demo.querySelector('[data-reset]').addEventListener('click', function () {
            applyPreset(demo, DEFAULTS);
            render(demo);
        });
    }

    function applyPreset(demo, preset) {
        Object.keys(preset).forEach(function (field) {
            demo.querySelector('input[data-field="' + field + '"]').value = preset[field];
        });
    }

    function bindFullFilesToggle(demo) {
        var button = demo.querySelector('[data-toggle-full]');
        var full = demo.querySelector('[data-full]');
        button.addEventListener('click', function () {
            full.hidden = !full.hidden;
            button.setAttribute('aria-expanded', String(!full.hidden));
            button.textContent = full.hidden ? 'Show full generated files' : 'Hide full generated files';
        });
    }

    // Renders the longest possible values once, measures every result file and pins it as its minimum height.
    function reserveResultHeights(demo) {
        var counter = demo.querySelector('[data-counter]');
        counter.style.minHeight = '';
        reservedHeights = {};
        renderResult(demo, longestValues(demo));
        demo.querySelectorAll('[data-diffs] .demo-code').forEach(function (code, i) {
            reservedHeights[OUTPUTS[i].id] = code.offsetHeight;
        });
        counter.style.minHeight = counter.offsetHeight + 'px';
        previous = {};
    }

    function longestValues(demo) {
        var values = {};
        demo.querySelectorAll('input[data-field]').forEach(function (input) {
            values[input.getAttribute('data-field')] = new Array(input.maxLength + 1).join('W');
        });
        return values;
    }

    function onEdit(demo) {
        if (!edited && window.mcReachGoal) {
            window.mcReachGoal('demo_edit');
        }
        edited = true;
        render(demo);
    }

    function render(demo) {
        var values = currentValues(demo);
        fitInputs(demo);
        OUTPUTS.forEach(function (output) {
            renderFullFile(demo, output.id, output.build(values), output.build(DEFAULTS));
        });
        renderResult(demo, values);
    }

    function currentValues(demo) {
        var values = {};
        demo.querySelectorAll('input[data-field]').forEach(function (input) {
            values[input.getAttribute('data-field')] = input.value;
        });
        return values;
    }

    function fitInputs(demo) {
        demo.querySelectorAll('input[data-field]').forEach(function (input) {
            input.style.width = (Math.max(input.value.length, 4) + 2) + 'ch';
        });
    }

    function renderFullFile(demo, id, lines, original) {
        demo.querySelector('[data-output="' + id + '"]').innerHTML = lines.map(function (line, i) {
            var classes = 'line' + (line !== original[i] ? ' changed' : '');
            return '<span class="' + classes + '">' + colorize(line) + '</span>';
        }).join('');
    }

    function colorize(line) {
        var safe = escapeHtml(line) || ' ';
        return safe.replace(/^(\s*)([\w.-]+):/, '$1<span class="k">$2</span>:');
    }

    function renderResult(demo, values) {
        var updatedFiles = 0;
        demo.querySelector('[data-diffs]').innerHTML = OUTPUTS.map(function (output) {
            var lines = output.build(values);
            var original = output.build(DEFAULTS);
            var changed = watchedLines(output).some(function (i) { return lines[i] !== original[i]; });
            if (changed) updatedFiles++;
            var html = resultFile(output, lines, original, previous[output.id], changed);
            previous[output.id] = lines;
            return html;
        }).join('');
        renderCounter(demo, editedFields(values), updatedFiles);
    }

    // Lines of a generated file that any input can change, found by comparing defaults with other values.
    function watchedLines(output) {
        if (!output.watched) {
            var original = output.build(DEFAULTS);
            var other = output.build(otherValues());
            output.watched = original.map(function (_, i) { return i; }).filter(function (i) {
                return original[i] !== other[i];
            });
        }
        return output.watched;
    }

    function otherValues() {
        var values = {};
        Object.keys(DEFAULTS).forEach(function (field) { values[field] = DEFAULTS[field] + '~'; });
        return values;
    }

    function resultFile(output, lines, original, before, changed) {
        return '<div class="demo-file demo-diff' + (changed ? ' has-changes' : '') + '">' +
            '<div class="demo-file-name"><span>' + output.file + '</span><span class="env-tag">' + output.env + '</span></div>' +
            '<pre class="demo-code"' + reservedHeight(output) + '>' + watchedBody(output, lines, original, before) + '</pre>' +
            '</div>';
    }

    function reservedHeight(output) {
        var height = reservedHeights[output.id];
        return height ? ' style="min-height: ' + height + 'px"' : '';
    }

    function watchedBody(output, lines, original, before) {
        var lastParent = null;
        return watchedLines(output).map(function (i) {
            var parent = parentKey(lines, i);
            var header = parent !== lastParent ? '<span class="line parent"><span class="k">' + escapeHtml(parent) + '</span>:</span>' : '';
            lastParent = parent;
            return header + watchedLine(lines[i], original[i], before && before[i] !== lines[i]);
        }).join('');
    }

    function parentKey(lines, index) {
        for (var i = index - 1; i >= 0; i--) {
            if (/^\S.*:$/.test(lines[i])) return lines[i].slice(0, -1);
        }
        return '';
    }

    function watchedLine(line, original, justChanged) {
        var key = '<span class="k">' + escapeHtml(keyOf(line)) + '</span>: ';
        if (line === original) {
            return '<span class="line slot unchanged">' + key + escapeHtml(valueOf(line)) + '</span>';
        }
        return '<span class="line slot changed' + (justChanged ? ' flash' : '') + '">' + key +
            '<del class="diff-old">' + escapeHtml(valueOf(original)) + '</del> &rarr; ' +
            '<span class="diff-new">' + escapeHtml(valueOf(line)) + '</span></span>';
    }

    function keyOf(line) {
        return line.trim().split(':')[0];
    }

    function valueOf(line) {
        return line.slice(line.indexOf(':') + 1).trim();
    }

    function editedFields(values) {
        return Object.keys(DEFAULTS).filter(function (field) {
            return values[field] !== DEFAULTS[field];
        }).length;
    }

    function renderCounter(demo, fields, files) {
        demo.querySelector('[data-counter]').innerHTML =
            'Edited <strong>' + fields + '</strong> of 3 source lines &rarr; ' +
            '<strong>' + files + '</strong> of 4 generated files updated';
    }

    function backend(v, poolSize, dbHost) {
        return [
            'name: payment-backend',
            '',
            'database:',
            '  host: ' + dbHost,
            '  name: payments',
            '  pool-size: ' + poolSize,
            '',
            'monitoring:',
            '  base-path: /monitoring',
            '  endpoints: ' + v.endpoints,
            '',
            'server:',
            '  context: ' + v.context,
            '  port: 80'
        ];
    }

    function frontend(v) {
        return [
            'name: payment-frontend',
            '',
            'monitoring:',
            '  base-path: /monitoring',
            '  endpoints: ' + v.endpoints,
            '',
            'payment-backend:',
            '  path: ' + v.context,
            '',
            'server:',
            '  port: 80'
        ];
    }

    function debounce(fn, wait) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, wait);
        };
    }

    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
})();
