export const clone = (obj) => JSON.parse(JSON.stringify(obj))

export const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)

export const $ = (_) => document.querySelector(_), $$ = (_) => document.querySelectorAll(_)

export const delay = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))

export const str = (template, ...args) => template.replace(/%s/g, () => args.shift())

export const log = console.log

export const sendToEmail = (body, subj, email = 'azatgt96@gmail.com') =>
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`

export const arrayMove = (arr, fromIndex, toIndex) => {
    const element = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, element)
}

export const getLocaleDate = () => {
    const tzo = new Date().getTimezoneOffset() * 60000
    return new Date(new Date() - tzo)
}