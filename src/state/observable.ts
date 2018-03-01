import Vue from 'vue';
import { ClassMetaData, IGetters } from '../di/class_meta';
import { assert, def, hideProperty } from '../util';
import { getAllState, proxyGetters, proxyState, replaceState, subscribe } from './helper';
import { globalMiddleware } from './middleware';
import { ScopeData, scopeKey } from './scope';

export function StateDecorator(target: object, propertyKey: string) {
    def(target, propertyKey, {
        get() {
            assert(false, 'must be init data');
        },
        set(value) {
            checkScope(this, target);
            Vue.util.defineReactive(this, propertyKey, value);
            proxyState(this, propertyKey);
        },
        enumerable: true,
        configurable: true
    });
}

export type IStateType = typeof StateDecorator
    & {
        replaceState: typeof replaceState,
        subscribe: typeof subscribe,
        getAllState: typeof getAllState,
        globalSubscribe: typeof globalMiddleware.subscribe
    };

export const State: IStateType = Object.assign(
    StateDecorator, {
        replaceState,
        subscribe,
        getAllState,
        globalSubscribe: globalMiddleware.subscribe.bind(globalMiddleware)
    });

export function Getter(target: object, propertyKey: string) {
    ClassMetaData.addGetterMeta(target, propertyKey);
    return {
        get() {
            checkScope(this, target);
            const get = () => (this[scopeKey] as ScopeData).$vm[propertyKey];
            def(this, propertyKey, {
                get,
                enumerable: false,
                configurable: true
            });
            return get.call(this);
        },
        enumerable: false,
        configurable: true
    };
}

export function checkScope(ctx: any, target: any) {
    if (!ScopeData.get(ctx)) {
        initScope(ctx, target);
    }
}

export function initScope(ctx: any, target: any) {
    const meta = ClassMetaData.get(target);
    const allGetterMeta = trackGetters(ctx, meta), keys = Object.keys(allGetterMeta);
    const vm: Vue = new Vue({
        computed: bindGetters(allGetterMeta, keys, ctx)
    });
    const scope = new ScopeData();
    hideProperty(ctx, scopeKey, scope);
    scope.$vm = vm;
    proxyGetters(ctx, keys);
}

function trackGetters(ctx: any, meta: ClassMetaData) {
    const ctors = meta.constructorMeta;
    const getters = {};
    ctors.filter(ctor => ctx instanceof ctor).forEach(ctor => {
        // getter extends
        Object.assign(getters, ClassMetaData.get(ctor.prototype).getterMeta);
    });
    return getters;
}

export function bindGetters(getters: IGetters, keys: string[], ctx: object) {
    const returnGetters = {};
    keys.forEach((key) => {
        returnGetters[key] = {
            get: getters[key].bind(ctx)
        };
    });
    return returnGetters;
}
