import * as React from 'react';
const logo = require('../../logo.svg');
type PropType = {
    post: (message: string) => void;
};

type StateType = {
    input: string;
};

export default class Header extends React.Component<PropType, StateType> {
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
        if (e.keyCode === 13) { // Enter
            this.props.post(this.state.input);
            e.currentTarget.value = '';
        }else if (e.keyCode === 9) { // Tab
            e.preventDefault();
        }else if (e.keyCode === 38) { // Arrow up
            e.currentTarget.value = 'Previous message';
            // Call method from props with a callback to get the previous message?
        }else if (e.keyCode === 40) { // Arrow down
            e.currentTarget.value = 'Next message';            
        }
    }
    updateState(e: React.FormEvent<HTMLInputElement>) {
        this.setState({input: e.currentTarget.value});
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
                />
            </div>
        );
    }
}
