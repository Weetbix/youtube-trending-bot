import { combineEpics } from 'redux-observable';
import { fetchStatsEpic } from './fetchStatsEpic';

export default combineEpics(fetchStatsEpic);
