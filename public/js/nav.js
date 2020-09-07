window.onstorage = event => {
    !event.newValue ?
        showClearCart(event.oldValue) : showLoad()
};

if (document.querySelector('.close-nav') && document.querySelector('.show-nav')) {
    document.querySelector('.close-nav').onclick = closeNav;
    document.querySelector('.show-nav').onclick = showNav;

    document.querySelector('.site-nav').addEventListener('mouseenter', showNav)
    document.querySelector('.site-nav').addEventListener('mouseleave', closeNav)

    getCategoryList()
}

function showNav() {
    document.querySelector('.site-nav').style.left = '0';
}

function closeNav() {
    document.querySelector('.site-nav').style.left = '-270px';
}


function getCategoryList() {
    fetch('/get-category-list',
        {
            method: 'POST'
        }
    ).then(response => response.text()
    ).then(body => {
        showCategoryList(JSON.parse(body))
    })
}


function showCategoryList(data) {
    let ul = document.createElement('ul');
    ul.className = 'category-list';
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.setAttribute('href', '/')
    a.textContent = 'Main';
    ul.prepend(li);
    li.prepend(a)
    for (let i = 0; i < data.length; i++) {
        let list = li.cloneNode(true)
        list.firstChild.setAttribute('href', `/cat/${data[i]['id']}`)
        list.firstChild.textContent = data[i]['category'];
        ul.append(list)
    }
    document.querySelector('#category-list').prepend(ul)
}



