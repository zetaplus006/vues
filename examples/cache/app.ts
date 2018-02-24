import { created, createDecorator, IMutation, IService, IVubxDecorator, mutation, Service } from 'vubx';
import Vue from 'vue';

const observable: IVubxDecorator = createDecorator(Vue);

const cacheKey = 'cache-key';

const plugin = (store: Counter) => {
    // subscribe方法用于订阅mutation中间件，
    store.subscribe({
        // tslint:disable-next-line:no-shadowed-variable
        before: (mutation: IMutation, _service: IService) => {
            // tslint:disable-next-line:no-console
            console.log(`
                mutation类型，给devtool使用: ${mutation.type}
                传入mutation方法的参数数组: ${JSON.stringify(mutation.payload)}
                调用的模块注入标识: ${mutation.identifier}
                调用的方法名: ${mutation.mutationType}
            `);
        },
        // after选项代表在mutation执行后执行的方法，相对的也提供before选项，用于在mutation执行前进行操作
        after: () => {
            // store中所有被Vue观察到的数据都会被代理到$state对象中
            localStorage.setItem(cacheKey, JSON.stringify(store.$state));
        }
    });
};

@observable({
    // 插件，插件在此类实例化后执行
    plugins: [
        plugin
    ]
})
class Counter extends Service {

    public num = 0;

    @mutation
    public add () {
        this.num++;
    }

    @created()
    public init () {
        const cacheStr = localStorage.getItem(cacheKey);
        if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            this.replaceState(cache);
        }
        setInterval(() => {
            // this.add();
            this.mutation(() => this.num++, 'add');
        }, 1000);
    }
}

const addition = new Counter();

new Vue({
    el: '#app',
    template: `<div>{{addition.num}}</div>`,
    computed: {
        addition () {
            return addition;
        }
    },
    mounted () {
        addition.init();
    }
});
