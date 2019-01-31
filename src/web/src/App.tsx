import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
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
                    <Col>{/* <StatsBox stats={{ KVRatio: 4 }} /> */}</Col>
                    <Col>2 of 3</Col>
                </Row>
            </Container>
        );
    }
}

export default App;
