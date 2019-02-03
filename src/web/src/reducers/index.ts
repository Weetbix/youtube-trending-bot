import { combineReducers } from 'redux';
import { StateType } from 'typesafe-actions';
import statsReducer from './statsReducer';

const rootReducer = combineReducers({
    stats: statsReducer,
});

export default rootReducer;
export type RootState = StateType<typeof rootReducer>;
