import { IonSelectOption, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/vue';
import { h } from 'vue';

export const IconBtn = ({ icon, disabled, size, ...props }) =>
  h(IonButton, { disabled, shape: 'round', fill: 'clear', ...props },
    () => h(IonIcon, { icon, size, slot: 'icon-only' }))

export const IconText = ({ text, icon }) =>
  h(IonItem, { button: true }, () => [
    h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
  ])

export const OptionsGroup = ({ label }) =>
  h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)