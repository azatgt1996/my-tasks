export const clone = (obj) => JSON.parse(JSON.stringify(obj))

export const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)

export const $ = (_) => document.querySelector(_), $$ = (_) => document.querySelectorAll(_)

export const delay = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))