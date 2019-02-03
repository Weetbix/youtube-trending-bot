import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Provider } from 'react-redux';
import configureStore from './store';

// Setup recompose for rxjs Observables
import { setObservableConfig } from 'recompose';
import { from } from 'rxjs';

setObservableConfig({
    // For some reason we get a huge error without casting this to any
    fromESObservable: from as any,
});

ReactDOM.render(
    <Provider store={configureStore()}>
        <App />
    </Provider>,
    document.getElementById('root'),
);
