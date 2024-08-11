
export function degToRad(deg: number){
  return deg * (Math.PI/180.0);
}

export function radToDeg(rad: number){
  return rad * (180.0/Math.PI);
}

export class Callbackable {
  _handler: Function[] = []
  constructor() {
    let watcher = {
      set: function <T extends keyof Callbackable>(obj: Callbackable, prop: T, value: Callbackable[T]) {
        obj[prop] = value;
        if (obj._handler != undefined) {
          // obj.handler.forEach((handler, idx) => handler.call(obj.parent[idx], prop, value));
          obj._handler.forEach((handler) => handler({ key: prop, value: value }));
        }
        return true;
      }
    }
    return new Proxy(this, watcher)
  }
  addCallback(handler: (KeyValuePair: KeyValuePair<Callbackable>) => void) {
    this._handler.push(handler);
  }
}

export type KeyValuePair<T> = { [N in keyof T]: { key: N, value: T[N] } }[keyof T]

/**
 * Some Typescript enum "exploit" to get the names of all enum options.
 * Thanks to Thea Alexandra Schöbl for finding+fixing a bug
 * @param myEnum  Name of an enum
 */
export function enumOptions(Models: Object): (string | number)[]{
  return Object.entries(Models)
      .filter(([key]) => Number.isNaN(Number(key)))
      .map(([_, value]) => value as string | number);
}

/**
 * Some Typescript enum "exploit" to get the keys of all enum options.
 * Thanks to Thea Alexandra Schöbl for finding+fixing a bug
 * @param myEnum  Name of an enum
 */
export function enumKeys(Models: Object): string[] {
  return Object.keys(Models).filter(key => Number.isNaN(Number(key)));
}



export function objectFlip<T extends object>(myEnum: T): {[key: string]: string } {
  return Object.keys(myEnum).reduce((ret, key) => {
    (ret as any)[String((myEnum as any)[key])] = key;
    return ret;
  }, {});
}
