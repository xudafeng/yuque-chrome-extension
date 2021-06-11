import pkgJSON from '../package.json';

export const pkg = pkgJSON;

const hyphen = '-';
const prefix = 'x';
export const siteName = pkgJSON.name.split(hyphen)[0];
export const REQUEST_HEADER_VERSION = `${prefix}${hyphen}${pkgJSON.name}${hyphen}version`;

export const STORAGE_KEYS = {
  CURRENT_ACCOUNT: 'storage/current-account',
};
