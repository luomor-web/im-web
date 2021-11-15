export const setJsonValue = (key, value) => {
    sessionStorage.setItem(key,JSON.stringify(value))
    // localStorage.setItem(key, JSON.stringify(value))
}

export const setValue = (key, value) => {
    sessionStorage.setItem(key,value)
    // localStorage.setItem(key, value)
}

export const getValue = (key) => {
    return sessionStorage.getItem(key)
    // return localStorage.getItem(key)
}

export const clear = () => {
    sessionStorage.clear()
}

export const removeKey = (key) => {
    sessionStorage.removeItem(key)
}

export default {setValue, setJsonValue, getValue, clear,removeKey}
