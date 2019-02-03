import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ChatBox from './ChatBox';
import StatsBox from './StatsBox';

class App extends Component {
    public render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <h1>Youtube Chat Bot</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StatsBox />
                    </Col>
                    <Col>
                        <ChatBox />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default App;
