import * as React from "react";
import Message from "./message";
import * as Type from "../helpers/types";

interface IPropType {
    messages: Type.IMessage[];
}

export default class Game extends React.Component<IPropType, null> {
    constructor(props: IPropType) {
        super(props);
    }

    public render() {
        return (
            <div className="game-message-wrapper">
                {this.props.messages.map((msg: Type.IMessage, i: number) => {
                    return <Message message={msg} key={i} />;
                })}
            </div>
        );
    }
}
