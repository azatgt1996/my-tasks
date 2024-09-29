import { IonSelectOption, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/vue';
import { h } from 'vue';

export const IconBtn = ({ icon, size, ...props }) =>
  h(IonButton, { shape: 'round', fill: 'clear', ...props },
    () => h(IonIcon, { icon, size, slot: 'icon-only' }))

export const IconTextBtn = ({ icon, iconPlace = 'start', text, ...props }) =>
  h(IonButton, { fill: 'clear', ...props },
    () => [h(IonIcon, { icon, slot: iconPlace }), text]
  )

export const IconText = ({ text, icon, ...props }) =>
  h(IonItem, { button: true, ...props }, () => [
    h(IonIcon, { icon, class: 'mr-10' }), h(IonLabel, () => text)
  ])

export const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)