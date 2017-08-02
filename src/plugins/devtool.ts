import { Middleware } from '../service/middleware';
import { Service } from '../service/observable';

export default function devtool(service: Service) {

    const devtoolHook =
        typeof window !== 'undefined' &&
        window['__VUE_DEVTOOLS_GLOBAL_HOOK__'];

    if (!devtoolHook) return;

    const store = simulationStore(service);

    store._devtoolHook = devtoolHook;

    devtoolHook.emit('vuex:init', store);

    devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
        service.replaceState(targetState);
    });

    service.__.middleware.subscribe({
        after: (mutation: any, state: any) => {
            devtoolHook.emit('vuex:mutation', mutation, state);
        }
    });
}

interface IStore {
    state: any;
    getters: any;
    _devtoolHook: any;
    // subscribe(fn: (mutation: string, state: any) => void): any
}

function simulationStore(service: Service): IStore {
    const store = {
        state: service.__.$state,
        getters: service.__.$getters,
        _devtoolHook: null
        // subscribe:
    };
    return store;
}
