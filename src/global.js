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

    const cancelToast = (message, callback) => {
        toastController.dismiss()
        toastController.create({
            message, duration: 3000, animated: true, color: 'secondary',
            buttons: [{ text: tr.cancel, handler: callback }]
        }).then(toast => toast.present())
    }

    const baseToast = (message, color, duration) => {
        if (params.offToastAlerts) return
        toastController.dismiss()
        toastController.create({ message, duration, animated: true, color }).then(toast => toast.present())
    }

    const toast = (message) => baseToast(message, 'secondary', 1500)

    const errToast = (message) => baseToast(message, 'danger', 2000)

    const alert = (message, header = tr.attention) =>
        alertController.create({ header, message, buttons: ['Ok'] })
            .then(alert => alert.present())

    const confirm = (message, callback) =>
        alertController.create({
            header: tr.attention, message,
            buttons: [tr.cancel, { text: 'Ok', role: 'ok', handler: callback }]
        }).then(async alert => {
            alert.present()
            const { role } = await alert.onDidDismiss()
            return role == 'ok'
        })


    const onOkClick = (data, callback) => {
        const result = data[0].trim()
        if (!result) {
            errToast(tr.fillField)
            return false
        }
        callback(result)
        return true
    }

    const onOkClick2 = (data, callback) => {
        if (!data) {
            errToast(tr.selectValue)
            return false
        }
        callback(data)
        return true
    }

    const prompt = (header, message, placeholder, value, callback) => //TODO: refactor me
        alertController.create({
            header, message,
            inputs: [{ placeholder, max: 20, value }],
            buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick(data, callback) }],
        }).then(alert => alert.present())

    const prompt2 = (header, message, options, callback) => //TODO: refactor me
        alertController.create({
            header, message,
            inputs: options.map(it => ({ type: 'radio', ...it })),
            buttons: [tr.cancel, { text: 'Ok', handler: data => onOkClick2(data, callback) }],
        }).then(alert => alert.present())

    onBeforeMount(() => storage.create())

    return { tr, params, storage, localeDate, toast, errToast, cancelToast, alert, confirm, prompt, prompt2 }
})