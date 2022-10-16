export function randInt(min: number, max: number) {
    const step = max - min;
    return ~~(step * Math.random() + min);
}