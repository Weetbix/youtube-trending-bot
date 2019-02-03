import { IStatsResponse } from '../../../brain/api';

export interface IState extends Partial<IStatsResponse> {}

export default (state: IState = {}, action: any) => {
    return state;
};
