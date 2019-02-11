import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Dispatch } from 'redux';
import { Action, RootState } from '../constants/types';
import ChatBox from './ChatBox';
import StatsBox from './StatsBox';

import { fetchStats } from '../actions/stats';

interface IProps {
    stats: RootState['stats'];
    fetchStats: () => any;
}

class App extends Component<IProps> {
    public componentDidMount() {
        this.props.fetchStats();
    }

    public render() {
        const { stats } = this.props;

        return (
            <Container>
                <Row>
                    <Col>
                        <h1>Youtube Chat Bot</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatsBox stats={stats} />
                    </Col>
                    <Col>
                        <ChatBox />
                    </Col>
                </Row>
            </Container>
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        stats: state.stats,
    };
}

function mapDispatchToProps(dispatch: Dispatch<Action>) {
    return {
        fetchStats: () => dispatch(fetchStats()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);
