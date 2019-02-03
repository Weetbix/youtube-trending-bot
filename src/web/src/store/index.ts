import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import rootReducer from '../reducers';

const initialState = { stats: { KVRatio: 5 } };

export default function configureStore() {
    return createStore(
        rootReducer,
        initialState,
        // applyMiddleware(createEpicMiddleware)
    );
}
