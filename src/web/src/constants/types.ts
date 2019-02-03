import { ActionType, StateType } from 'typesafe-actions';
import * as actions from '../actions';
import rootReducer from '../reducers';

// The shape of our state, generated from the reducers
export type RootState = StateType<typeof rootReducer>;

// Generate a union of all the action types
export type Action = ActionType<typeof actions>;
