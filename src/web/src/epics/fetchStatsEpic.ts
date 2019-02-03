import { Epic } from 'redux-observable';
import { ajax } from 'rxjs/ajax';
import { filter, map, pluck, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { Action, RootState } from '../constants/types';

import * as actions from '../actions/stats';

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
