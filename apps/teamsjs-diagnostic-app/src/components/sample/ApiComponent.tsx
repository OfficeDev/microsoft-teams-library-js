export interface ApiComponent {
  component: React.ComponentType<any>;
  title: string;
  inputType?: 'text' | 'checkbox';
  onClick?: () => Promise<string>;
  defaultInput?: string;
}
