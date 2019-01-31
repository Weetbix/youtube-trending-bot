import React from 'react';

import { componentFromStream } from 'recompose';
import { from, ObservableInput } from 'rxjs';
import { debounceTime, filter, map, pluck } from 'rxjs/operators';

interface IProps {
    inputText: string;
}

const Message = componentFromStream<IProps>(props$ => {
    const message$ = from(props$ as ObservableInput<IProps>).pipe(
        debounceTime(1000),
        pluck('inputText'),
        filter<string>(text => text.length > 0),
        map(text => <span>{text}</span>),
    );

    return message$;
});

export default Message;
