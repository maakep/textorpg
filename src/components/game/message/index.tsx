import * as React from "react";
import * as Type from "../../helpers/types";
import {dateToTime} from "../../helpers/text-format";
import {isNullOrWhitespace} from "../../helpers/string-helper";

interface IPropType {
    message: Type.IMessage;
}

export default class Message extends React.Component<IPropType, null> {
    constructor(props: IPropType) {
        super(props);
    }

    public render() {
        return (
            <div className={this.props.message.messageLevel + " game-message"}>
                <span className="message-time">{dateToTime(this.props.message.time.toString())}</span>
                {
                    !isNullOrWhitespace(this.props.message.author) && (
                    <span className="message-author">{this.props.message.author}</span>
                )}
                <span className="message-text">{this.props.message.message}</span>
            </div>
        );
    }
}
