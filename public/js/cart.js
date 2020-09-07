const lS = new LocalStorage('cart')
const cart = new Cart(lS)
let dB;

showLoad()
function showLoad() {
    let datalS = lS.get()
    if (datalS) {
        cart.value = datalS;
        ajaxGetGoodsInfo()
    } else {
        showClearCart()
    }
}


document.querySelectorAll('.add-to-cart').forEach(function (el) {
    el.addEventListener('click', function () {
        let target = event.target.dataset.goods_id;
        if (target) cart.add(parseInt(target, 10))
    })
})


function ajaxGetGoodsInfo() {
    fetch('/get-goods-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            'key': Object.keys(cart.value)
        })
    })
        .then(response => response.text())
        .then(data => {
            dB = JSON.parse(data)
            showCart(JSON.parse(data))
        })
}


function showCart(data) {
    let out = `<table class="table table-striped table-cart"><tbody>`;
    let total = 0;
    for (let key in cart.value) {
        out += `<tr><td colspan="4"><a href='/goods/${key}'>${data[key]['name']}</a></td></tr>`
        out += `<tr><td><i class="far fa-minus-square cart-minus" data-goods_id="${key}"></i></td>`
        out += `<td>${cart.value[key]}</td>`;
        out += `<td><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`
        out += `<td>${formatPrice(data[key]['cost'] * cart.value[key])} ${data.currency}`
        out += `</tr>`;
        total += cart.value[key] * data[key]['cost'];
    }
    out += `<tr><td colspan="3">Total: </td><td>${formatPrice(total)} ${data.currency}</td></tr>`
    out += `</tbody></table>`;
    document.querySelector('#cart-nav').innerHTML = out;
    document.querySelectorAll('.cart-minus').forEach(function (elem) {
        elem.onclick = () => cart.remove(event.target.dataset.goods_id)
    })
    document.querySelectorAll('.cart-plus').forEach(function (elem) {
        elem.onclick = () => cart.add(event.target.dataset.goods_id)
    })
}

function showClearCart(idLastGoods) {

    lS.remove()
    cart.delete()
    if (document.querySelector('#cart-nav')) {
        document.querySelector('#cart-nav').innerHTML = '<p class="text-black">Товары в корзине отсутствуют.</p>'
    }
}


function formatPrice(price) {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')
}
















// function addToCart(id) {
//     if (cart[id]) {
//         cart[id]++
//     } else {
//         cart[id] = 1
//         ajaxGetGoodsInfo()
//     }
//     console.log(cart)
//     addLocalStorage('cart', JSON.stringify(cart))
// }

// function removeFromCart(id) {
//     if (cart[id]) {
//         cart[id]--
//     }
//     if (cart[id] <= 0) {
//         delete cart[id]
//         ajaxGetGoodsInfo()
//     }
//     addLocalStorage('cart', JSON.stringify(cart))
// }

// function addLocalStorage(key, value) {
//     if (cart[0]) {
//         removeLocalStorage(key);
//         return;
//     }
//     localStorage.setItem(key, value);
// }

// function removeLocalStorage(key) {
//     localStorage.removeItem(key)
// }
