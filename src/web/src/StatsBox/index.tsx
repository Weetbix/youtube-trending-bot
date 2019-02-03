import React, { StatelessComponent } from 'react';
import { Table } from 'react-bootstrap';
import { IGenerateMessageRespone, IStatsResponse } from '../../../brain/api';

interface IStatsBoxProps {
    stats: IStatsResponse;
}

function tableRow(
    property: string | number | undefined,
    annotation: string,
): JSX.Element {
    property = property ? property : '';
    return (
        <tr>
            <th>{annotation}</th>
            <th>
                {typeof property === 'number' ? property.toFixed(2) : property}
            </th>
        </tr>
    );
}

const StatsBox: StatelessComponent<IStatsBoxProps> = props => {
    const { stats = {} } = props;

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Value</th>
                </tr>
            </thead>
            {/* <tbody>{tableRow(stats.KVRatio, 'Key value ratio')}</tbody> */}
        </Table>
    );
};

export default StatsBox;