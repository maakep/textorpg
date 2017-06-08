import * as React from 'react';

type PropType = {
    message: string;
};

export default class Message extends React.Component<PropType, null> {
    constructor(props: PropType) {
        super(props);
    }

    render() {
        return (
            <div className="game-message">{this.props.message}</div>
        );
    }
}