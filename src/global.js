import { defineStore } from 'pinia'
import { onBeforeMount, reactive } from 'vue'
import { toastController, alertController } from '@ionic/vue'
import { Storage } from "@ionic/storage";

export const useGlobalStore = defineStore('global', () => {
    const storage = new Storage()
    const tr = reactive({})
    const params = reactive({}) // setting params

    const localeDate = (date, noTime = false) => {
        const dt = date ? new Date(date) : new Date()
        if (noTime) return dt.toLocaleDateString(tr._code)
        return dt.toLocaleString(tr._code)
    }

    const cancelToast = (message, callback) => toastController.create({
        message, duration: 3000, animated: true, color: 'secondary',
        buttons: [{ text: tr.cancel, handler: callback }]
    }).then(toast => toast.present())

    const baseToast = (message, color, duration) => !params.offToastAlerts &&
        toastController.create({ message, duration, animated: true, color }).then(toast => toast.present())

    const toast = (message) => baseToast(message, 'secondary', 1500)

    const errToast = (message) => baseToast(message, 'danger', 2000)

    const alert = (message, header = tr.attention) =>
        alertController.create({ header, message, buttons: ['Ok'] })
            .then(alert => alert.present())

    const confirm = (message, callback) =>
        alertController.create({
            header: tr.attention, message,
            buttons: [tr.cancel, { text: 'Ok', handler: callback }]
        }).then(alert => alert.present())


    const onOkClick = (data, callback) => {
        const result = data[0].trim()
        if (!result) {
            errToast(tr.fillField)
            return false
        }
        callback(result)
        return true
    }

    const prompt = (header, message, placeholder, value, callback) =>
        alertController.create({
            header, message,
            inputs: [{ placeholder, max: 20, value }],
            buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick(data, callback) }],
        }).then(alert => alert.present())

    onBeforeMount(async () => {
        await storage.create()
    })

    return { tr, params, storage, localeDate, toast, errToast, cancelToast, alert, confirm, prompt }
})