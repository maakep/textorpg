import * as Type from "./types";

export function PlayerMessage(message: string,
                              author: string,
                              coordinates: Type.ICoordinates = null): Type.IMessage {
    const time = new Date();
    const msg: Type.IMessage = {
        author,
        coordinates,
        messageLevel: Type.MessageLevel.Player,
        time,
        message,
    };
    return msg;
}

export function ServerMessage(message: string,
                              author: string = null,
                              coordinates: Type.ICoordinates = null): Type.IMessage {
    const time = new Date();

    const msg: Type.IMessage = {
        author,
        coordinates,
        messageLevel: Type.MessageLevel.Server,
        time,
        message,
    };
    return msg;
}
export function SystemMessage(message: string,
                              author: string = null,
                              coordinates: Type.ICoordinates = null): Type.IMessage {
    const time = new Date();

    const msg: Type.IMessage = {
        author,
        coordinates,
        messageLevel: Type.MessageLevel.System,
        time,
        message,
    };
    return msg;
}
