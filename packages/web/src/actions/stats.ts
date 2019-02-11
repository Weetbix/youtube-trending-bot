import { createAction } from 'typesafe-actions';
import { IStatsResponse } from '@youtube-trending-bot/brain/api';

export const fetchStats = createAction('FETCH_STATS', resolve => () =>
    resolve({
        isFetching: true,
    }),
);

export const setStats = createAction(
    'SET_STATS',
    resolve => (stats: IStatsResponse) =>
        resolve({
            ...stats,
            isFetching: false,
        }),
);
