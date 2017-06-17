import * as React from 'react';
import Player from './components/Player';
var name: string = null;

type StateType = {
    name: string,
}

export class EnterName extends React.Component<null, StateType>{
    constructor(props: null) {
        super(props);
        var storedName = localStorage.getItem('name');
        this.state = {
            name: storedName,
        }
    }
    setName(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode == 13) {
            let newName = e.currentTarget.value;
            console.log(newName);
            if (newName.length > 2) {
                localStorage.setItem('name', newName);
                this.setState({name: newName});
            }
        }
    }

    render(){
        return (
            (this.state.name != null) 
                ? <Player name={this.state.name} /> 
                : <input onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => this.setName(e)} />
        );
    }
}