import AppInstallDialogAPIs from '../../apis/AppInstallDialogApi';
import BarCodeAPIs from './../../apis/BarCodeApi';
import CalendarAPIs from './../../apis/CalendarApi';
import CallAPIs from './../../apis/CallApi';
import ChatAPIs from './../../apis/ChatApi';
import ClipboardAPIs from './../../apis/ClipboardApi';
import CustomAPIs from './../../apis/CustomApi';
import DialogAPIs from './../../apis/DialogApi';
import DialogCardAPIs from './../../apis/DialogCardApi';

const apiComponents = [
  { component: AppInstallDialogAPIs, title: 'AppInstallDialogAPIs' },
  { component: BarCodeAPIs, title: 'BarCodeAPIs' },
  { component: CalendarAPIs, title: 'CalendarAPIs' },
  { component: CallAPIs, title: 'CallAPIs' },
  { component: ChatAPIs, title: 'ChatAPIs' },
  { component: ClipboardAPIs, title: 'ClipboardAPIs' },
  { component: CustomAPIs, title: 'CustomAPIs' },
  { component: DialogAPIs, title: 'DialogAPIs' },
  { component: DialogCardAPIs, title: 'DialogCardAPIs' },
];

export default apiComponents;
