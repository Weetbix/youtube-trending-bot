import { createAction } from 'typesafe-actions';

const FETCH_STATS = 'FETCH_STATS';
const SET_STATS = 'SET_STATS';

export const fetchStats = createAction(FETCH_STATS, resolve => () =>
    resolve({
        isFetching: true,
    }),
);

export const setStats = createAction(SET_STATS, resolve => () =>
    resolve({
        KVRatio: 10,
    }),
);
