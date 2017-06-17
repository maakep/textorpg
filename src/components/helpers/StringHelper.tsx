export function isNullOrWhitespace(str: string): boolean {
    return (str === null || str === ' ' || str === undefined || str === '');
}

export function afterSpace(str: string): string {
    return str.substr(str.indexOf(' ')+1);
}