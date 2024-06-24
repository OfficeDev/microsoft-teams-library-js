import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import BarCodeAPIs from './../../apis/BarCodeApi';
import CalendarAPIs from './../../apis/CalendarApi';
import CallAPIs from './../../apis/CallApi';
import ChatAPIs from './../../apis/ChatApi';
import ClipboardAPIs from './../../apis/ClipboardApi';
import CustomAPIs from './../../apis/CustomApi';
import DialogAPIs from './../../apis/DialogApi';
import DialogCardAPIs from './../../apis/DialogCardApi';

export interface ApiComponent {
  title: string;
  name: string;
  inputType: 'text' | 'checkbox' | 'none';
  onClick: any; // Adjust the type of onClick as per your implementation
  defaultInput?: string;
  defaultCheckboxState?: boolean;
  label?: string;
  options: string[];
}

const apiComponents: ApiComponent[] = [
  {
    title: 'App Install Dialog APIs',
    name: 'appInstallDialog',
    inputType: 'text',
    onClick: (input: string) => console.log(`App Install Dialog API clicked with input: ${input}`),
    defaultInput: '',
    options: ['Option 1', 'Option 2', 'Option 3']
  },
  {
    title: 'Bar Code APIs',
    name: 'barCode',
    inputType: 'checkbox',
    onClick: (isChecked: boolean) => console.log(`Bar Code API clicked. isChecked: ${isChecked}`),
    defaultCheckboxState: false,
    label: 'Enable Bar Code API',
    options: ['Option A', 'Option B', 'Option C']
  },
  {
    title: 'Calendar APIs',
    name: 'calendar',
    inputType: 'none',
    onClick: () => console.log('Calendar API clicked'),
    options: ['Option X', 'Option Y', 'Option Z']
  },
  // Add more API components as needed
];

export default apiComponents;
