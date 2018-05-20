import {
  createElement,
  render,
  renderDom
} from './element';

let vertualDom = createElement('ul', {class: 'list'}, [
  createElement('li', {class: 'item'}, ['a']),
  createElement('li', {class: 'item'}, ['b']),
  createElement('li', {class: 'item'}, ['c'])
]);

// 将虚拟DOM转化成了真实DOM并渲染到页面上
let el = render(vertualDom);
renderDom(el, document.getElementById('root'));

console.log(el);