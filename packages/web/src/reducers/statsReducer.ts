import { IStatsResponse } from '@yotube-trending-bot/brain/api';
import { getType } from 'typesafe-actions';
import * as actions from '../actions/stats';
import { Action } from '../constants/types';

export interface IState extends Partial<IStatsResponse> {
    isFetching: boolean;
}

export default (state: IState = { isFetching: false }, action: Action) => {
    switch (action.type) {
        case getType(actions.fetchStats):
            return {
                ...state,
                isFetching: true,
            };

        case getType(actions.setStats):
            return {
                ...state,
                ...action.payload,
            };
    }
    return state;
};
