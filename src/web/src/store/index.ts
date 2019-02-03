import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { Action, RootState } from '../constants/types';

import rootEpic from '../epics';
import rootReducer from '../reducers';

const initialState = {};
const epicMiddleware = createEpicMiddleware<Action, Action, RootState>();

export default function configureStore() {
    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(epicMiddleware),
    );
    epicMiddleware.run(rootEpic);

    return store;
}
