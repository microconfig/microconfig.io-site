
function isCheckbox(element) {
    return element instanceof HTMLInputElement
        && element.getAttribute('type') == 'checkbox'
}

function getExampleBlockHeight(width, element) {
    if (isCheckbox(element)) {

        const row = element.closest('.row-with-switch');
        const label = Array.from(row.getElementsByTagName('label'));
        const rowStyle = getComputedStyle(row);
        const codeRows = Array.from(row.querySelectorAll('.equal-cols'));

        let commonRowHeights = [];
        let offRowHeights = [];
        let onRowHeights = [];

        const offHeights = [];
        const onHeights = [];
        const commonHeights = [];
        const rowPadds = [];

        codeRows.forEach(row => {

            let codeTitles = Array.from(row.querySelectorAll('.code-title'));
            let codeBlocks = Array.from(row.querySelectorAll('.code-block'));

            codeBlocks.map((block, i) => {
                if (block.closest('div').classList.contains('common')) {
                    commonRowHeights.push(outerHeight(block) + outerHeight(codeTitles[i]));
                }

                if (block.closest('div').classList.contains('off')) {
                    offRowHeights.push(outerHeight(block) + outerHeight(codeTitles[i]));

                }

                if (block.closest('div').classList.contains('on')) {
                    onRowHeights.push(outerHeight(block) + outerHeight(codeTitles[i]));
                }
            });

            if (width >= 768) {
                if (commonRowHeights.length != 0) { commonHeights.push(Math.max(...commonRowHeights)); }
                if (offRowHeights.length != 0) { offHeights.push(Math.max(...offRowHeights)); }
                if (onRowHeights.length != 0) { onHeights.push(Math.max(...onRowHeights)); }
            }

            else {
                if (commonRowHeights.length != 0) { commonHeights.push(...commonRowHeights); }
                if (offRowHeights.length != 0) { offHeights.push(...offRowHeights); }
                if (onRowHeights.length != 0) { onHeights.push(...onRowHeights); }
            }

            rowPadds.push(parseInt(getComputedStyle(row).paddingTop));

            commonRowHeights = [];
            offRowHeights = [];
            onRowHeights = [];
        });

        const switcherHeight = outerHeight(label[0]);
        const rowsPaddings = sumArray(rowPadds);

        if (width >= 768) {
            setHeights([...new Set(commonHeights)], [...new Set(offHeights)], [...new Set(onHeights)]);
        }

        else {
            setHeights(commonHeights, offHeights, onHeights);
        }

        row.style.height = switcherHeight + rowsPaddings + parseFloat(rowStyle.paddingTop) + parseFloat(rowStyle.paddingBottom) + Math.max(this.offRowHeight, this.onRowHeight) + 'px';
    }
}

function setHeights(commonHeightsArray, offHeightsArray, onHeightsArray) {
    this.commonRowHeight = sumArray(commonHeightsArray);
    this.offRowHeight = sumArray(offHeightsArray);
    this.onRowHeight = sumArray(onHeightsArray);

    if (commonRowHeight != 0) {
        this.offRowHeight += this.commonRowHeight;
        this.onRowHeight += this.commonRowHeight;
    }
}

function outerHeight(el) {
    var height = el.scrollHeight;
    var style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

function sumArray(array) {
    if (array.length == 0) return 0;

    return array.reduce((sum, curr) => {
        return sum + parseInt(curr);
    }, 0);
}

document.body.onload = function () {
    setHeight();
};

document.body.onresize = function () {
    setHeight();
};

function setHeight() {
    const screenWidth = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    const switchersBlocks = Array.from(document.querySelectorAll('.toggle'));

    switchersBlocks.forEach(block => getExampleBlockHeight(screenWidth, block));
}
