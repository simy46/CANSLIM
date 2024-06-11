export function listenToButtonEvent() {
    const div = document.getElementById('div-btn');
    const btn = document.getElementById('btn');
    const nav = document.querySelector('nav');

    function buttonOnclick(e) {
        e.stopPropagation();
        const isHidden = nav.classList.contains('nav-hidden');
        if (isHidden) {
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
            toggleI(false);
        } else {
            nav.classList.remove('nav-visible');
            nav.classList.add('nav-hidden');
            toggleI(true);
        }
    }

    div.addEventListener('click', buttonOnclick);
    btn.addEventListener('click', buttonOnclick);
}

function toggleI(isDown) {
    const icon = document.querySelector('#btn > i');
    if (isDown) {
        icon.classList.remove('rotate-up');
    } else {
        icon.classList.add('rotate-up');
    }
}