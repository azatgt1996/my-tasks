import { toastController, alertController } from '@ionic/vue';

export const toast = (message, color = 'success') =>
    toastController.create({ message, duration: 1500, color, animated: true }).then(toast => toast.present())

export const alert = (message, header = 'Attention') =>
    alertController.create({ message, header, buttons: ['Ok'] })
        .then(alert => alert.present())

export const confirm = (message, callback) =>
    alertController.create({
        message, header: 'Attention',
        buttons: ['Cancel', { text: 'Ok', handler: callback }]
    }).then(alert => alert.present())

export const clone = (obj) => JSON.parse(JSON.stringify(obj))
export const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2)
export const $ = (_) => document.querySelector(_), $$ = (_) => document.querySelectorAll(_)