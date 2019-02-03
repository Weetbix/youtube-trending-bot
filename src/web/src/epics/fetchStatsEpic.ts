import { Epic, ofType } from 'redux-observable';
import { filter, map, pluck, switchMap } from 'rxjs/operators';
import { ActionType, isActionOf } from 'typesafe-actions';
import { RootState } from '../reducers';

import { ajax } from 'rxjs/ajax';
import * as actions from '../actions/stats';
type Action = ActionType<typeof actions>;

export const fetchStatsEpic: Epic<Action, Action, RootState> = (
    action$,
    store$,
) => {
    return action$.pipe(
        filter(isActionOf(actions.fetchStats)),
        switchMap(() => ajax('api/stats').pipe(pluck('response'))),
        map(values => actions.setStats(values)),
    );
};
