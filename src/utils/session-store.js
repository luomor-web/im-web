// const Store = require('electron-store');
// const store = new Store();
export const setJsonValue = (key, value) => {
    // sessionStorage.setItem(key,JSON.stringify(value))
    sessionStorage.setItem(key, JSON.stringify(value))

    // if (process.env.IS_ELECTRON) {
    //     store.set(key,JSON.stringify(value))
    // }
}

export const getJsonValue = (key) => {
    // sessionStorage.setItem(key,JSON.stringify(value))

    const value = getValue(key);
    if(!value) return

    return JSON.parse(value)

    // if (process.env.IS_ELECTRON) {
    //     store.set(key,JSON.stringify(value))
    // }
}

export const setValue = (key, value) => {
    // sessionStorage.setItem(key,value)
    sessionStorage.setItem(key, value)
    // if (process.env.IS_ELECTRON) {
    //     store.set(key,value)
    // }
}

export const getValue = (key) => {
    // if (process.env.IS_ELECTRON) {
    //    return store.get(key)
    // }
    // return sessionStorage.getItem(key)
    return sessionStorage.getItem(key)

}

export const clear = () => {
    // if (process.env.IS_ELECTRON) {
    //     store.clear()
    // }
    // sessionStorage.clear()
    sessionStorage.clear()
}

export const removeKey = (key) => {
    // if (process.env.IS_ELECTRON) {
    //     store.delete(key)
    // }
    // sessionStorage.removeItem(key)
    sessionStorage.removeItem(key)
}

export default {setValue, setJsonValue,getJsonValue, getValue, clear,removeKey}
