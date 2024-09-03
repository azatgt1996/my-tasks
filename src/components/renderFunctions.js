import { IonSelectOption, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/vue';
import { h } from 'vue';

export const IconBtn = ({ icon, disabled }) =>
  h(IonButton, { disabled }, () => h(IonIcon, { icon }))

export const IconText = ({ text, icon }) =>
    h(IonItem, { button: true }, () => [
      h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
    ])

export const OptionsGroup = ({ label }) =>
    h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)