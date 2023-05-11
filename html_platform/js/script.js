const list = document.createElement('ul');
const info = document.createElement('p');
const html = document.querySelector('html');



document.body.appendChild(info);
document.body.appendChild(list);

function displaySubMenu(li) {

    var subMenu = li.getElementsByTagName("ul")[0];

    subMenu.style.display = "block";

}

function hideSubMenu(li) {

    var subMenu = li.getElementsByTagName("ul")[0];

    subMenu.style.display = "none";

}

