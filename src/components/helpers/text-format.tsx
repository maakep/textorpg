export function commaSeparatedArray(array: object[], property: string = null): string {
    const stringArray: any[] = (property != null) ? getArrayFromProperty(array, property) : array;
    let str: string = null;
    if (stringArray.length > 0) {
        str = "";
        for (const s of stringArray) {
            str += s + ", ";
        }
        str = str.slice(0, -2);
        str += ". ";
    }
    return str;
}

function getArrayFromProperty(array: object[], property: string): string[] {
    return array.map((obj: any) => {
        return obj[property];
    });
}

export function dateToTime(date: string): string {
    const dateObject: Date = new Date(Date.parse(date));
    const time = addLeadingZero(dateObject.getHours()) +
               ":" +
               addLeadingZero(dateObject.getMinutes());
    return time;
}

function addLeadingZero(integer: number): string {
    let stringInteger = integer.toString();
    if (integer <= 9) {
        stringInteger = "0" + integer;
    }
    return stringInteger;
}
