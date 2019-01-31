import React, { StatelessComponent } from 'react';
import { Table } from 'react-bootstrap';
import { IGenerateMessageRespone, IStatsResponse } from '../../../brain/api';

interface IStatsBoxProps {
    name: string;
}

function tableRow(
    property: string | undefined,
    annotation: string,
): JSX.Element | null {
    if (property) {
        return (
            <tr>
                <th>{annotation}</th>
                <th>{property}</th>
            </tr>
        );
    }
    return null;
}

const StatsBox: StatelessComponent<IStatsBoxProps> = props => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>{tableRow(props.name, 'name here')}</tbody>
        </Table>
    );
};

export default StatsBox;
