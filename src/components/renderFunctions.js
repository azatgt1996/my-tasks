import { IonSelectOption, IonItem, IonIcon, IonLabel } from '@ionic/vue';
import { h } from 'vue';

export const IconText = ({ text, icon }) =>
    h(IonItem, { button: true }, () => [
      h(IonIcon, { icon, style: 'margin-right: 10px' }), h(IonLabel, () => text)
    ])

export const OptionsGroup = ({ label }) =>
    h(IonSelectOption, { disabled: true, class: 'options-group' }, () => label)