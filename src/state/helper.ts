
import { DIMetaData } from '../di/di_meta';

import { assert, defGet } from '../util';

import { IMutation } from './mutation';
import { ScopeData } from './scope';

export interface IConstructor { new(...args: any[]): {}; }

export interface IstateClass<T> { new(...args: any[]): T; }

export type IIdentifier = string;

export type IPlugin = (state: any) => void;

export type IMutationSubscribe = (mutation: IMutation, state: any) => any;

export function proxyState(ctx: any, key: string) {
    const $state = ScopeData.get(ctx)!.$state;
    defGet($state, key, () => ctx[key]);
}

export function proxyGetters(ctx: any, getterKeys: string[]) {
    const $getters = ScopeData.get(ctx)!.$getters;
    getterKeys.forEach((key) => {
        defGet($getters, key, () => ctx[key]);
    });
}

export function useStrict(state: any) {
    const identifier = DIMetaData.get(state).identifier, scope = ScopeData.get(state);
    if (process.env.NODE_ENV !== 'production' && scope) {
        scope.$vm && scope.$vm.$watch<any>(() => {
            return scope.$state;
        }, () => {
            assert(state.__scope__.isCommitting,
                `Do not mutate vue-class-state state[${String(identifier)}] data outside mutation handlers.`);
        }, { deep: true, sync: true } as any
        );
    }
}

export function replaceState(targetState: any, state: any): void {
    const scope = ScopeData.get(targetState);
    if (scope === null) return;
    const temp = scope.isCommitting;
    scope.isCommitting = true;
    for (const key in state) {
        if (targetState.hasOwnProperty(key)) {
            targetState[key] = state[key];
        }
    }
    scope.isCommitting = temp;
}

export function subscribe(
    targetState: any,
    option: {
        before?: IMutationSubscribe;
        after?: IMutationSubscribe;
    }) {
    const scope = ScopeData.get(targetState);
    if (scope) {
        scope.middleware.subscribe(option);
    }
}

/*
export function getAllGetters(target: any) {
    let getters = {};
    let prototypeSuper = target;
    while (
        prototypeSuper !== Object.prototype
        && prototypeSuper !== null) {
        getters = {
            ...getPropertyGetters(prototypeSuper),
            ...getters
        };
        prototypeSuper = Object.getPrototypeOf(prototypeSuper);
    }
    return getters;
}

export function getPropertyGetters(target: any): { [key: string]: { get(): any, set?(): void } } {
    const getters = {};
    const injectMeta = ClassMetaData.get(target).injectPropertyMeta;
    const keys: string[] = Object.getOwnPropertyNames(target);
    keys.forEach((key) => {
        // skip @lazyInject
        if (key === 'constructor' || injectMeta.has(key)) { return; }
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor && descriptor.get) {
            getters[key] = {
                get: descriptor.get
            };
        }
    });
    return getters;
}
 */
