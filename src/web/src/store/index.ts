import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { ActionType } from 'typesafe-actions';
import { RootState } from '../reducers';

import * as actions from '../actions/stats';
type Action = ActionType<typeof actions>;

import rootEpic from '../epics';
import rootReducer from '../reducers';

const initialState = { stats: { KVRatio: 5 } };
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
