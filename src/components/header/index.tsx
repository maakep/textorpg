import * as React from "react";

interface IPropType {
    post: (message: string) => void;
    coordinates: {x: number, y: number};
}

interface IStateType {
    input: string;
}

export default class Header extends React.Component<IPropType, IStateType> {
    private prevMessageIndex = -1;
    private previousMessages = new Array<string>();
    constructor(props: IPropType) {
        super(props);
        this.state = {
            input: "",
        };
    }
    public resetFocus(obj: React.FocusEvent<HTMLInputElement>): void {
        obj.currentTarget.focus();
    }
    public keyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode === 13 && e.currentTarget.value !== "") { // Enter
            this.handleEnterPress(e);
        }else if (e.keyCode === 9) { // Tab
            e.preventDefault();
        }else if (e.keyCode === 38 || e.keyCode === 40) { // Arrow up or key down
            e.preventDefault();
            this.setToPreviousMessage(e, 39 - e.keyCode); // 39-38 = 1, 39-40 = -1.
        }else {
            this.prevMessageIndex = -1;
        }
    }
    public updateState(e: React.FormEvent<HTMLInputElement>) {
        this.setState({input: e.currentTarget.value});
    }
    public setToPreviousMessage(e: React.KeyboardEvent<HTMLInputElement>, incrementer: number) {
        const min = 0;
        const max = this.previousMessages.length - 1;
        const val = this.prevMessageIndex + incrementer;
        this.prevMessageIndex = Math.min(Math.max(min, val), max);
        e.currentTarget.value = (this.previousMessages[this.prevMessageIndex] !== undefined)
                                ? this.previousMessages[this.prevMessageIndex]
                                : "";
        this.updateState(e);
    }
    public handleEnterPress(e: React.KeyboardEvent<HTMLInputElement>) {
        this.props.post(this.state.input);
        this.previousMessages.unshift(this.state.input);
        this.prevMessageIndex = -1;
        e.currentTarget.value = "";
        this.updateState(e);
    }
    public render() {
        return (
            <div className="game-header">
                <img src={require("../../logo.svg")} className="game-logo" alt="logo" />
                <input
                    autoFocus={true}
                    className="game-input"
                    type="text"
                    onBlur={(e) => this.resetFocus(e)}
                    onKeyDown={(e) => this.keyPress(e)}
                    onChange={(e) => this.updateState(e)}
                    value={this.state.input}
                />
                {this.props.coordinates.x}, {this.props.coordinates.y}
            </div>
        );
    }
}
