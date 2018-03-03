import { IIdentifier } from '../state/helper';
import { hideProperty } from '../util';

export interface IGetters { [key: string]: () => any; }

const classMetaKey = '__meta__';

export class ClassMetaData {

    public static get(target: any): ClassMetaData {
        if (target.constructor.hasOwnProperty(classMetaKey)) {
            return target.constructor[classMetaKey];
        }
        const meta = new ClassMetaData();
        hideProperty(target.constructor, classMetaKey, meta);
        return meta;
    }

    public injectParameterMeta: IIdentifier[] = [];

    public getterKeys: string[] = [];

    public addGetterKey(key: string) {

        if (this.getterKeys.indexOf(key) === -1) {
            this.getterKeys.push(key);
        }
    }

}

/* function trackCtorMeta(ctor: IConstructor, childCtor: IConstructor) {
    if (ctor === Object) {
        return;
    }
    const baseProto = Object.getPrototypeOf(ctor.prototype);
    const baseCtor = baseProto.constructor;
    const baseMeta = ClassMetaData.get(baseCtor.prototype);
    baseMeta.constructorMeta.push(childCtor);
    trackCtorMeta(baseCtor, childCtor);
}
 */
