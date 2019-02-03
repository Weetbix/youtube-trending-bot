import { stat } from 'fs';
import { ActionType, getType } from 'typesafe-actions';
import { IStatsResponse } from '../../../brain/api';
import * as actions from '../actions/stats';

type Action = ActionType<typeof actions>;

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
