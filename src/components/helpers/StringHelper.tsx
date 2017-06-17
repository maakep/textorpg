export function isNullOrWhitespace(str: string): boolean {
    return (str === null || str === ' ' || str === undefined);
}

export function afterSpace(str: string): string {
    return str.substr(str.indexOf(' ')+1);
}