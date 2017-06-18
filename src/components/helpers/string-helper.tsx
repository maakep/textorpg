export function isNullOrWhitespace(str: string): boolean {
    return (str === null || str === " " || str === undefined || str === "");
}

export function stringAfterSpace(str: string): string {
    return str.substr(str.indexOf(" ") + 1);
}
