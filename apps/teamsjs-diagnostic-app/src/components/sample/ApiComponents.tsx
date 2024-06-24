export interface ApiComponent {
  title: string;
  name: string;
  inputType: 'text' | 'checkbox' | 'none';
  onClick: any;
  defaultInput?: string;
  defaultCheckboxState?: boolean;
  label?: string;
  options: string[];
}

const apiComponents: ApiComponent[] = [
  {
    title: 'AppInstallDialog',
    name: 'appInstallDialog',
    options: ['OpenAppInstallDialog', 'CheckAppInstallCapability'],
    defaultInput: 'default input for OpenAppInstallDialog',
    inputType: 'text',
    onClick: () => console.log('App Install Dialog API called'),
  },
  {
    title: 'Bar Code APIs',
    name: 'barCode',
    options: ['checkBarCodeCapability', 'scanBarCode', 'hasBarCodePermission', 'requestBarCodePermission'],
    defaultInput: '{}',
    inputType: 'text',
    onClick: () => console.log('Barcode API called'),
    },
  {
    title: 'Calendar APIs',
    name: 'calendar',
    inputType: 'none',
    onClick: () => console.log('Calendar API clicked'),
    options: ['Option X', 'Option Y', 'Option Z']
  },
  // Add more API components
];

export default apiComponents;
