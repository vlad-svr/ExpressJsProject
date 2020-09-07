const form = document.forms.formLogin


function sendLogin(data) {
    fetch('/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }
    ).then(response => response.text()
    ).then((body, err) => {
        if (body == '0') {
            alertMessage('Вы указали неверные данные для входа.');
            return;
        }
        console.log(body)
        console.log(response.headers)
        console.log(document.location.host)
        document.location.href = `${document.location.host}/admin`
    })
}
console.log(form)
form.addEventListener('submit', function (e) {
    e.preventDefault()
    sendLogin({
        'login': form.elements.login.value,
        'password': form.elements.password.value
    })
})

function alertMessage(text) {
    return Swal.fire({
        title: 'Внимание!',
        text: text,
        icon: 'warning',
        confirmButtonText: 'Продолжить'
    })
}