const btn = document.querySelector('.btn');


btn.addEventListener('click', toggleBtnHandler);

function toggleBtnHandler() {
    const codeBlocks = Array.from(document.querySelectorAll('.code-block'));
    if (btn.textContent == 'back') {
        btn.textContent = 'front';
    }
    else {
        btn.textContent = 'back';
    }

    codeBlocks.forEach(block => {
        if (block.classList.contains('hidden')) {
            block.classList.remove('hidden');
            block.style.height = getMaxHeight(codeBlocks);;
        }
        else {
            block.classList.add('hidden');
            block.style.height = 0;
        }
    });

}

function getMaxHeight(codeBlocks) {
    const heights = codeBlocks.map(block => block.scrollHeight);
    return Math.max(...heights) + 'px';
}
