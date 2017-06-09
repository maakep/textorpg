import * as React from 'react';
const logo = require('../../logo.svg');
type PropType = {
    post: (message: string) => void;
    coordinates: {x: number, y: number}
};

type StateType = {
    input: string,
};

export default class Header extends React.Component<PropType, StateType> {
    prevMessageIndex = -1;
    previousMessages = new Array<string>();
    constructor (props: PropType) {
        super(props);
        this.state = {
            input: '',
        };
    }
    resetFocus(obj: React.FocusEvent<HTMLInputElement>): void {
        obj.currentTarget.focus();
    }
    keyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode === 13 && e.currentTarget.value != '') { // Enter
            this.handleEnterPress(e);
        }else if (e.keyCode === 9) { // Tab
            e.preventDefault();
        }else if (e.keyCode === 38 || e.keyCode === 40) { // Arrow up or key down
            e.preventDefault();
            this.setToPreviousMessage(e, 39-e.keyCode); // 39-38 = 1, 39-40 = -1.
        }else {
            this.prevMessageIndex = -1;    
        }
    }
    updateState(e: React.FormEvent<HTMLInputElement>) {
        this.setState({input: e.currentTarget.value});
    }
    setToPreviousMessage(e: React.KeyboardEvent<HTMLInputElement>, incrementer: number) {
        var min = 0;
        var max = this.previousMessages.length-1;
        var val = this.prevMessageIndex + incrementer;
        this.prevMessageIndex = Math.min(Math.max(min, val), max);
        e.currentTarget.value = (this.previousMessages[this.prevMessageIndex] != undefined) ? this.previousMessages[this.prevMessageIndex] : '';
        this.updateState(e);
    }
    handleEnterPress(e: React.KeyboardEvent<HTMLInputElement>){
        this.props.post(this.state.input);
        this.previousMessages.unshift(this.state.input);
        this.prevMessageIndex = -1;
        e.currentTarget.value = '';
        this.updateState(e);
    }
    render() {
        return (
            <div className="game-header">
                <img src={logo} className="game-logo" alt="logo" />
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
