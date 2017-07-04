// https://github.com/OliverJAsh/js-map-helpers

const appendMap = <Key, Value>(map1: Map<Key, Value>, map2: Map<Key, Value>): Map<Key, Value> =>
    new Map([...map1, ...map2]);

export const concatMap = <Key, Value>(maps: Map<Key, Value>[]): Map<Key, Value> =>
    maps.reduce(appendMap, new Map<Key, Value>());
