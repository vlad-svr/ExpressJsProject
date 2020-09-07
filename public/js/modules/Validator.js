class Validator {
    alertTemplate = {
        username: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'Вы указали некорректное имя.',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
        email: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'Вы указали некорректный адрес электронной почты.',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
        phone: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'Вы указали некорректный номер телефона.',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
        address: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'Вы должны указать свой адрес, чтобы продолжить заказ',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
        falseRule: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'Вы должны согласиться с правилами, чтобы продолжить заказ',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
        cart: () => {
            return Swal.fire({
                title: 'Внимание!',
                text: 'В корзине отсутствуют товары. Добавьте их, чтобы продолжить заказ',
                icon: 'warning',
                confirmButtonText: 'Продолжить'
            })
        },
    }

    alertOut = []


    catch() {
        if (this.alertOut.length <= 0 && !this.alertOut[0]) {
            return true
        } else {
            for (let item of this.alertOut.reverse()) item()
            return false
        }
    }

    isName(str) {
        str = str.trim();
        if (typeof str == 'string' && str.length < 20 && str.length > 3 && str.length != '') {
            return str;
        } else {
            this.alertOut.push(this.alertTemplate.username)
            return false
        }
    }

    isEmail(str) {
        str = str.trim();
        if (typeof str == 'string' && str.length < 40 && str.length > 4 && str.length != '') {
            return str;
        } else {
            this.alertOut.push(this.alertTemplate.email)
            return false
        }
    }

    isPhone(str) {
        str = str.trim();
        if (typeof str == 'string' && str.length <= 13 && str.length >= 9 && str.length != '') {
            return str;
        } else {
            this.alertOut.push(this.alertTemplate.phone)
            return false
        }
    }

    isAdress(str) {
        str = str.trim();
        if (typeof str == 'string' && str.length >= 12 && str.length != '') {
            return str;
        } else {
            this.alertOut.push(this.alertTemplate.address)
            return false
        }
    }

    isRule(boolean) {
        if (boolean) {
            return true;
        } else {
            this.alertOut.push(this.alertTemplate.falseRule)
            return false
        }
    }

    isCartGoods(data) {
        if (data) {
            return data;
        } else {
            this.alertOut.push(this.alertTemplate.cart)
            return false
        }
    }
}
