import { Epic, ofType } from 'redux-observable';
import { delay, filter, map } from 'rxjs/operators';
import { ActionType, isActionOf } from 'typesafe-actions';
import { RootState } from '../reducers';

import * as actions from '../actions/stats';
type Action = ActionType<typeof actions>;

export const fetchStatsEpic: Epic<Action, Action, RootState> = (
    action$,
    store$,
) => {
    return action$.pipe(
        filter(isActionOf(actions.fetchStats)),
        delay(2000),
        map(actions.setStats),
    );
};
