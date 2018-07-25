
export default class Settings {

    constructor(cb, h, defaults, hashKeys, replaceState) {
        this.defaultSettings = defaults
        this.hashKeys = hashKeys
        this.replaceState = (replaceState === true)

        let keys = Object.keys(this.defaultSettings);
        for (let k in keys) {
            this[keys[k]] = this.defaultSettings[keys[k]];
        }
        this.fromUrl(h)
        this.cb = cb;
    }

    serializeToUrl() {
        let res = []
        let keys = Object.keys(this.defaultSettings)
        for (let k in keys) {
            if (this.defaultSettings[keys[k]] != this[keys[k]]) {
                res.push(keys[k] + "=" + this[keys[k]])
            }
        }
        return res.join("&")
    }

    fromUrl(s) {
        let parts = s.substr(1).split("&")
        for (let i in parts) {
            let eq = parts[i].split("=")
            if (eq[0] in this.defaultSettings && this.defaultSettings[eq[0]] != eq[1]) {
                this[eq[0]] = eq[1]
            }
        }
    }

    getHash() {
        let hk = Object.keys(this.defaultSettings)
        if (this.hashKeys) {
            hk = this.hashKeys;
        }

        let res = []
        for (let i in this.hashKeys) {
            res.push(this.hashKeys[i])
        }
        return res.join("");

    }

    set(st) {
        let keys = Object.keys(this.defaultSettings)
        for (let k in keys) {
            if (keys[k] in st) {
                this[keys[k]] = st[keys[k]]
            }
        }

        let scrollV = document.body.scrollTop;
        let scrollH = document.body.scrollLeft;

        let h = this.serializeToUrl()

        const new_path = window.location.pathname + window.location.search + '#' + h

        if (this.replaceState) {
            console.log("replacing")
            history.replaceState(null, null,  new_path)
        } else {
            window.location.hash = '#' + h
        }

        ga('set', 'page', new_path);
        ga('send', 'pageview');

        if (h == "") {
            /* Restore the scroll offset */
            document.body.scrollTop = scrollV;
            document.body.scrollLeft = scrollH;
        }

        this.cb(this.getHash(), st);
    }
}
