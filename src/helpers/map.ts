// https://github.com/OliverJAsh/js-map-helpers

export const normalizeMapToEntriesArray = <Key, Value>(map: Map<Key, Value>) =>
    Array.from(map.entries());

export const reduceMap = <Key, Value, Acc>(
    reducer: (acc: Acc, value: Value, key: Key) => Acc,
    initial: Acc,
) => (map: Map<Key, Value>): Acc =>
    normalizeMapToEntriesArray(map).reduce(
        (innerAcc, [key, value]) => reducer(innerAcc, value, key),
        initial,
    );

type StringDictionary<Value> = { [key: string]: Value };

export const toStringDictionary = <Value>(
    map: Map<string, Value>,
): StringDictionary<Value> =>
    reduceMap<string, Value, StringDictionary<Value>>((acc, value, key) => {
        acc[key] = value;
        return acc;
    }, {})(map);

const appendMap = <Key, Value>(map1: Map<Key, Value>, map2: Map<Key, Value>): Map<Key, Value> =>
    new Map([...map1, ...map2]);

export const concatMap = <Key, Value>(maps: Map<Key, Value>[]): Map<Key, Value> =>
    maps.reduce(appendMap, new Map<Key, Value>());
