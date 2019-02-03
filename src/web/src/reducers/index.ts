import { combineReducers } from 'redux';
import statsReducer from './statsReducer';

const rootReducer = combineReducers({
    stats: statsReducer,
});

export default rootReducer;
