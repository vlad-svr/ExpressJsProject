class LocalStorage {
    constructor(key) {
        this.key = key
    }

    isEmpty() {
        for (let key in JSON.parse(localStorage.getItem(this.key))) {
            return false;
        }
        return true;
    }

    get() {
        if (!this.isEmpty()) {
            return JSON.parse(localStorage.getItem(this.key))
        } else {
            return false
        }
    }

    add(value) {
        localStorage.setItem(this.key, value);
    }

    remove() {
        localStorage.removeItem('cart')
    }
}