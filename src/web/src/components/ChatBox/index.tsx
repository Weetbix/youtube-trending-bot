import React from 'react';
import { Container } from 'react-bootstrap';
import Message from './Message';

import { componentFromStream, createEventHandler } from 'recompose';
import { combineLatest, from } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';

interface IProps {}

const ChatBox = componentFromStream<IProps>(props$ => {
    const { handler, stream } = createEventHandler();

    // Creates an observable stream which push the
    // input valu whenever it changes
    const input$ = from(stream).pipe(
        map((e: any) => e.target.value),
        // We need to force this stream to start with something
        // to use combineLatest.
        startWith(''),
    );

    return combineLatest(from(props$ as any), input$).pipe(
        map(([props, input]) => (
            <Container>
                <div>
                    <Message inputText={input} />
                </div>
                <input onChange={handler} />
            </Container>
        )),
    );
});

export default ChatBox;
