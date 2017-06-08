import * as React from 'react';
import Message from './message';

type PropType = {
    messages: string[];
};

export default class Game extends React.Component<PropType, null> {
    constructor (props: PropType) {
        super(props);
    }
    
    render() {
        return (
            <div className="game-message-wrapper">
                {this.props.messages.map(function(msg: string, i: number) {
                    return <Message message={msg} key={i} />;
                })}
            </div>            
        );
    }
}
