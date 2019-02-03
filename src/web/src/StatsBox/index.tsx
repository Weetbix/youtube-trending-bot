import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { IStatsResponse } from '../../../brain/api';

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

interface IStatsBoxProps {
    stats?: Partial<IStatsResponse>;
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
            <tbody>
                {tableRow(stats.videosProcessed, 'Videos processed')}
                {tableRow(stats.sentencesProcessed, 'Sentences processed')}
                {tableRow(stats.totalKeys, 'Total keys in map')}
                {tableRow(stats.responseKeywords, 'Number of response words')}
                {tableRow(stats.memoryUsage, 'Memory usage')}
                {tableRow(stats.sizeOnDisk, 'Size on disk')}
                {tableRow(stats.KVRatio, 'Key value ratio')}
                {tableRow(stats.timeOfNextUpdate, 'Time until next update')}
            </tbody>
        </Table>
    );
};

export default StatsBox;
