import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import ChatBox from './ChatBox';
import { RootState } from './reducers';
import StatsBox from './StatsBox';

interface IProps {
    stats: RootState['stats'];
}

class App extends Component<IProps> {
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

export default connect(mapStateToProps)(App);
