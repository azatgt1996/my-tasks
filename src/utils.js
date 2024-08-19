import { toastController } from '@ionic/vue';

export const toast = (message, color = 'success') =>
    toastController.create({ message, duration: 1500, color, animated: true }).then(msg => msg.present())

export const clone = (obj) => JSON.parse(JSON.stringify(obj))
export const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)
export const $ = (_) => document.querySelector(_), $$ = (_) => document.querySelectorAll(_)