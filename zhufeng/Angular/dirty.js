// 脏值检测 你要先保留一个原有的值 有一个新值
// vue 是不停的监控新放进来的值，$watch,$apply
// angular.js 更新的方式是手动更新
// angular 有一个 scope 的概念

// viewModel
function Scope() {
  this.$$watchers = [];
}

// 负责检查的
Scope.prototype.$digest = function() {
  // 至少执行一次
  var dirty = true; // 默认我认为只要调用了 disgest 方法就应该去查一次
  var count = 9;
  do {
    dirty = this.$digestOne();
    // 已经查了 10 次
    if (count ===0) {
      throw new Error('10 $digest() iterations reached, Aborting!');
    }
  }
  while (dirty && count--);
}

// 检查一次
Scope.prototype.$digestOne = function() {
  let dirty = false;
  this.$$watchers.forEach(watcher => {
    let oldVal = watcher.last; // 老值
    let newVal = this[watcher.exp]; // 新值
    if (oldVal !== newVal) { // 更新了
      watcher.fn(newVal, oldVal); // 调用了 fn 可能就会更改数据，更改数据就应该再查一遍
      dirty = true;
      watcher.last = newVal; // 更新老值，让老值的值变成最新的值，方便下次更新
    }
  });
  return dirty;
}

Scope.prototype.$watch = function(exp, fn) {
  // $watch 中应该保留的内容有函数 还有 当前的老值，保留一个表达式
  this.$$watchers.push({
    fn,
    last: this[exp],
    exp
  });
}

Scope.prototype.$apply = function(exp, fn) {
  this.$digest();
}

let scope = new Scope();
scope.name = 'hanshuo';
scope.age = 9;
scope.$watch('name', function(newVal, oldVal) {
  console.log(newVal);
  console.log(oldVal);
});
scope.$watch('age', function(newVal, oldVal) {
  scope.name = 'hanshuo.No1';
});

scope.age = '10';
scope.$apply();