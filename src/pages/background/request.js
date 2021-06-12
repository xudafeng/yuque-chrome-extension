import Chrome from '@/core/chrome';
import { REQUEST_HEADER_VERSION, siteName } from '@/config';

const isInChromeExtension = list => list.find(item => item.name.includes(REQUEST_HEADER_VERSION));
