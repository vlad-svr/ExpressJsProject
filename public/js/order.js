window.onstorage = event => {
    !event.newValue ?
        showClearCart(event.oldValue) : showLoad()
};

if (!new LocalStorage('cart').get()) {
    document.getElementById('cart-nav').textContent = 'Товары в корзине отсутствуют... Добавьте их для заказа.'
}


document.querySelector('#lite-shop-order').onsubmit = function (e) {
    e.preventDefault();
    let validator = new Validator();
    let form = document.forms['lite-shop-order']
    let dataForm = {
        cart: validator.isCartGoods(new LocalStorage('cart').get()),
        username: form.username.value,
        phone: form.phone.value,
        email: validator.isEmail(form.email.value),
        address: validator.isAdress(form.address.value),
    }
    validator.isRule(form.rule.checked)

    if (validator.catch() === true) {
        fetchForm('/finish-order', 'POST', 'application/json', dataForm)
    } else {
        // outAlertValidation(validator.catch())
        return false
    }
}

function fetchForm(url, method, header, data) {
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': `${header};charset=utf-8`
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(result => {
            let data = JSON.parse(result);
            if (data == 1) {
                Swal.fire({
                    allowOutsideClick: 'false',
                    allowEscapeKey: 'false',
                    allowEnterKey: 'false',
                    backdrop: `rgba(0,0,0,0.7)`,
                    position: 'top',
                    icon: 'success',
                    title: 'Ваш заказ оформлен!',
                    showConfirmButton: false,
                    timer: 2000
                })
                new LocalStorage('cart').remove()
                setTimeout(() => location.href = '/', 1000)
            } else if (data.errors) {
                console.log('err')
                let valid = new Validator();
                console.log(data.errors)
                data.errors.reverse().forEach(element => {
                    valid.alertTemplate[element['param']]()
                });
            } else {
                Swal.fire({
                    title: 'Ошибка!',
                    text: 'Попробуйте еще раз.',
                    icon: 'danger',
                    confirmButtonText: 'Продолжить'
                })
            }
        })
}

// function outAlertValidation(arr) {
//     let divFirst = document.querySelector('#alert_out');
//     divFirst.innerHTML = '';
//     for (let item of arr) {
//         let divNew = document.createElement('p');
//         divNew.className = 'alert alert-danger';
//         divNew.textContent = item
//         divFirst.append(divNew);
//     }
// }