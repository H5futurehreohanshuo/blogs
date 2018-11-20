// 基于函数的高阶特性，实现程序：找出想要的 people 并执行 printer 方法

function printPeople(people, selector, printer) {
  people.forEach(function(person) {
    if (selector(person)) {
      printer(person);
    }
  });
}

var inUS = person => person.address.country === 'US';

printPeople(people, person, console.log);