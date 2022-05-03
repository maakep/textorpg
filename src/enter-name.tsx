import * as React from "react";
import Player from "./components/player";

interface IStateType {
    name: string;
}

export class EnterName extends React.Component<{}, IStateType> {
    constructor(props: {}) {
        super(props);
        const storedName = localStorage.getItem("name");
        this.state = {
            name: storedName,
        };
    }
    public setName(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.keyCode === 13) {
            const newName = e.currentTarget.value;
            if (newName.length > 2) {
                localStorage.setItem("name", newName);
                this.setState({name: newName});
            }
        }
    }

    public render() {
        return (
            (this.state.name != null)
                ? <Player name={this.state.name} />
                : <input onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => this.setName(e)} />
        );
    }
}
