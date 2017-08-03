import Vue from 'vue';
import { createDecorator, Service, mutation } from 'vubx';
import { identifier } from '../chat/store/index';
import { lazyInject } from '../../src/service/provider';
const obverable = createDecorator(Vue);

@obverable()
export class Children extends Service {
    text = 'lazyInject child service';
    data = {
        s: 1
    };
}

@obverable({
    // strict: true,
    identifier: Symbol('appService'),
    root: true,
    injector: [
        lazyInject<AppService>('child', Symbol('child'), Children)
    ]
})
export class AppService extends Service {

    // state
    private num1: number = 0;
    private num2: number = 0;

    // No initial value, Will not enter the vue
    private closer: any;

    child: Children;
    child2: Children;

    // computed
    get sum() {
        return this.num1 + this.num2;
    }

    // vubx hook
    created() {
        this.$on('close', () => {
            clearInterval(this.closer);
        });
        this.$watch('sum', (sum) => {
            if (sum >= 10) {
                console.log(this.child);
            }
        });
        this.appendChild(new Children(), 'child2', Symbol('child2'));
    }

    start() {
        this.closer = setInterval(() => {
            this.change();
            if (this.sum >= 10) {
                this.$emit('close');
            }
        }, 1000);
        // console.log(this);
        // setTimeout(() => {
        //     console.log(this.child);
        // }, 3000);
    }

    @mutation
    change() {
        this.num1++;
        this.num2++;
    }
}
