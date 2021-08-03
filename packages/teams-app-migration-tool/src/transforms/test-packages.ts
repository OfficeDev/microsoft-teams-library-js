import { Transform, FileInfo, API } from 'jscodeshift';

const transform: Transform = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  console.log('Test for jscodeshift and related dependency');
  console.log(root);
  return root.toSource({ quote: 'single' });
};
export default transform;
