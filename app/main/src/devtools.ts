import installer, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

export const installExtension = async () => {
  installer(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
};
