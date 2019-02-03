import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Dispatch, bindActionCreators } from 'redux';
import { ActionType } from 'typesafe-actions';
import ChatBox from './ChatBox';
import { RootState } from './reducers';
import StatsBox from './StatsBox';

import * as actions from './actions/stats';
type Action = ActionType<typeof actions>;

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
                {stats.isFetching ? 'FETCHING' : null}
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
        fetchStats: () => dispatch(actions.fetchStats()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);
