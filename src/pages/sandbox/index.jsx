import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';

import App from './App';

const importAll = r => r.keys().forEach(r);
importAll(require.context('@/assets/icons', false, /\.png$/));

ReactDOM.render(<App />, document.getElementById('ReactApp'));
