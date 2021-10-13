export const setJsonValue = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const setValue = (key, value) => {
    localStorage.setItem(key, value)
}

export const getValue = (key) => {
    return localStorage.getItem(key)
}

export default {setValue, setJsonValue, getValue}
