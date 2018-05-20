class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      // 如果这个元素能获取到，我们才开始编译
      // 1. 先把真实的DOM移入到内存中 fragment
      let fragment = this.node2fragment(this.el);

      // 2. 编译 => 提取想要的元素节点 v-model 和文本节点 {{}}
      this.compile(fragment);

      // 3.把编译的 fragment 再塞回到页面里去
      this.el.appendChild(fragment);
    }
  }

  /* 专门写一些辅助的方法 */
  isElementNode(node) {
    return node.nodeType === 1;
  }

  // 是不是指令
  isDirective(name) {
    return name.includes('v-');
  }

  /* 核心的方法 */
  compileElement(node) {
    // 带 v-model
    let attrs = node.attributes; //取出当前节点的属性
    Array.from(attrs).forEach(attr => {
      // 判断属性名字是不是包含 'v-'
      let attrName = attr.name; // eg: v-model
      if (this.isDirective(attrName)) {
        // 取到对应的值放到节点中
        let expr = attr.value;
        // 截取 v- 后面的内容
        let [, type] = attrName.split('-');
        // node vm.$data expr
        CompileUtil[type](node, this.vm, expr);
      }
    });
  }

  compileText(node) {
    // 带 {{}}
    let expr = node.textContent; // 取文本中的内容
    let reg = /\{\{([^}]+)\}\}/g; // {{a}} {{b}} {{c}}
    if (reg.test(expr)) {
      // node this.vm.$data text
      CompileUtil['text'](node, this.vm, expr);
    }
  }

  node2fragment(el) { // 需要将 el 中的内容全部放到内存中
    // 文档碎片
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment; // 内存中的节点
  }

  compile(fragment) {
    // 需要递归
    let childNodes = fragment.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        // 是元素节点
        // 元素节点还需要继续深入的检查
        // 这里需要编译元素
        this.compileElement(node);
        this.compile(node);
      } else {
        // 文本节点
        // 这里需要编译文本
        this.compileText(node);
      }
    });
  }
}

CompileUtil = {
  // 获取实例上对应的数据
  getVal(vm, expr) {
    expr = expr.split('.');
    return expr.reduce((prev, next) => { // vm.$data.a
      return prev[next];
    }, vm.$data);
  },
  // 获取编译文本后的结果
  getTextVal(vm, expr) {
    return expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      return this.getVal(vm, args[1]);
    });
  },
  // 文本处理
  text(node, vm, expr) {
    let updateFn = this.updater['textUpdater'];
    let value = this.getTextVal(vm, expr);

    expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      new Watcher(vm, args[1], (newVal) => {
        // 如果数据变化了，文本节点需要重新获取依赖的数据更新文本中的节点
        updateFn && updateFn(node, this.getTextVal(vm, expr));
      });
    });

    updateFn && updateFn(node, value);
  },
  setVal(vm ,expr, value) {
    expr = expr.split('.');
    // 收敛
    return expr.reduce((prev, next, currentIndex) => {
      if (currentIndex === expr.length - 1) {
        return prev[next] = value;
      }
      return prev[next];
    }, vm.$data);
  },
  // 输入框的处理
  model(node, vm, expr) {
    let updateFn = this.updater['modelUpdater'];
    // 这里应该加一个监控，数据变化了，应该调用这个 watch 的 callback
    new Watcher(vm, expr, (newVal) => {
      // 当值变化后回调用 cb 将新的值传递过来 ()
      updateFn && updateFn(node, this.getVal(vm, expr));
    });
    node.addEventListener('input', (e) => {
      let newValue = e.target.value;
      this.setVal(vm, expr, newValue);
    });
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  updater: {
    // 文本更新
    textUpdater(node, value) {
      node.textContent = value;
    },
    // 输入框更新
    modelUpdater(node, value) {
      node.value = value;
    }
  }
};