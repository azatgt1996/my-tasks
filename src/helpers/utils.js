import { Haptics } from "@capacitor/haptics";
import { emptyDatetime } from "@/helpers/constants.js";
import EventBus from "@/helpers/eventBus";

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

export const getLateDate = () => {
    const tzo = new Date().getTimezoneOffset() * 60000
    const now = new Date(new Date() - tzo)
    const next = new Date(now.setTime(now.getTime() + 5 * 60000))
    return new Date(next).toISOString().slice(0, -8)
}

export const getDT = (date) => new Date(date === emptyDatetime ? 0 : date)

export const isLater = (date) => new Date() < getDT(date)

// type: primary, danger, secondary etc
export const getHexColor = (type) => getComputedStyle(document.documentElement).getPropertyValue(`--ion-color-${type}`)

export const vibrate = (duration = 10) => Haptics.vibrate({ duration })

export const $bus = new EventBus()