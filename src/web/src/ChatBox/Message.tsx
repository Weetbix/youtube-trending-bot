import React from 'react';

import { componentFromStream } from 'recompose';
import { from, ObservableInput } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, filter, map, pluck, switchMap } from 'rxjs/operators';

interface IProps {
    inputText: string;
}

const formatURL = (inputText: string) =>
    `/generateMessage?replyTo=${encodeURI(inputText)}`;

const Message = componentFromStream<IProps>(props$ => {
    const message$ = from(props$ as ObservableInput<IProps>).pipe(
        debounceTime(1000),
        pluck('inputText'),
        filter<string>(text => text.length > 0),
        map(formatURL),
        switchMap(url =>
            ajax(url).pipe(
                pluck('response'),
                pluck('message'),
                map(text => <span>{text}</span>),
            ),
        ),
    );

    return message$;
});

export default Message;
