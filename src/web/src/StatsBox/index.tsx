import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { IGenerateMessageRespone, IStatsResponse } from '../../../brain/api';

interface IStatsBoxProps {
    stats?: Partial<IStatsResponse>;
}

function tableRow(
    property: string | number = '-',
    annotation: string,
): JSX.Element {
    return (
        <tr>
            <th>{annotation}</th>
            <th>
                {typeof property === 'number' ? property.toFixed(2) : property}
            </th>
        </tr>
    );
}

const StatsBox: FunctionComponent<IStatsBoxProps> = ({ stats = {} }) => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>{tableRow(stats.KVRatio, 'Key value ratio')}</tbody>
        </Table>
    );
};

export default StatsBox;
