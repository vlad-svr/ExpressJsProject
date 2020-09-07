class Cart {
    _cart = {}
    constructor(localStorage) {
        this.localStorage = localStorage
    }

    get value() {
        return this._cart
    }

    set value(val) {
        this._cart = val;
    }


    isEmpty() {
        for (let key in this._cart) {
            return false;
        }
        return true;
    }

    add(id) {
        id = parseInt(id)
        if (this._cart[id]) {
            this._cart[id]++
            if (dB) showCart(dB)
        } else {
            this._cart[id] = 1
            ajaxGetGoodsInfo(this.value)
        }
        this.localStorage.add(JSON.stringify(this._cart))
    }

    remove(id) {
        if (this._cart[id]) {
            this._cart[id]--
            if (dB) showCart(dB)
        }
        if (this._cart[id] <= 0) {
            delete this._cart[id]
            if (dB) showCart(dB)
            if (this.isEmpty()) {
                document.querySelector('#cart-nav').innerHTML = '';
                this.localStorage.remove();
                return
            }
        }
        this.localStorage.add(JSON.stringify(this._cart))
    }

    delete() {
        this._cart = {}
    }
}