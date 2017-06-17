export function commaSeparatedArray(array: object[], property: string = null): string {
    var stringArray: any[] = (property != null) ? getArrayFromProperty(array, property) : array;
    var str: string = null;
    if (stringArray.length > 0) {
        str = '';
        for (var i = 0; i < stringArray.length; i++) {
            str += stringArray[i] + ', ';
        }
        str = str.slice(0, -2);
        str += '. ';
    }
    return str;
}

function getArrayFromProperty(array: object[], property: string): string[] {
    return array.map(function(obj: any) {
        return obj[property];
    });
}