class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    // 要对这个数据将原有的属性改成get和set形式
    if(!data || typeof data !== 'object') {
      return;
    }
    // 要将数据 一一劫持 先获取到 data 的 key 和 value
    Object.keys(data).forEach(key => {
      // 劫持
      this.defineReactive(data, key, data[key]);
      this.observe(data[key]); // 深度递归劫持
    });
  }

  // 定义数据响应式
  defineReactive(obj, key, value) {
    let that = this;
    // 每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      // 当取值时调用的方法
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      // 当给 data 属性中设置值的时候 更改获取的属性的值
      set(newValue) {
        if (value !== newValue) {
          // 如果设置了一个对象，则继续劫持
          that.observe(newValue);
          value = newValue;
          // 通知所有人，数据更新了
          dep.notify();
        }
      }
    });
  }
}

class Dep {
  constructor() {
    // 订阅的数组
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}