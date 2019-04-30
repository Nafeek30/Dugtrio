console.log("Ex1RobertM");

let x;
console.log(typeof(x));
x = 20;
console.log(typeof(x));
x = 'abc';
console.log(typeof(x));

x = [2, 3, "abc"];
console.log(typeof(x));

x = {a: 20, b: "xyz", c: 3.14, d: Symbol("test")}; // object
console.log(typeof(x));
console.log(x);

const PI = 3.14;
console.log("Value of PI is", PI); //takes any number of args

// Strings
console.log("********************* string *********************");
let m = "your major is computer science";
let m2 = 'abcd';
console.log(m, m2);
const len = m.length;
console.log("length of m is", len);

const loc = m.indexOf("computer");
console.log("index of computer is", loc);

const m3 = m.substr(3, 5);  // start index, # of chars
console.log(m3);

for(let i = 0; i < m.length; i++) console.log(m.charAt(i), m[i]);

for(const ch of m2) console.log(ch);

const m4 = "a.b.c.d.e.f";
const m5 = m4.split('.');
console.log(m5);

// spread operator ...
const m6 = [...m4]; // m4 is spread into an array, each char is an element
console.log(m6);

// string template
const first = 'John';
const last = 'Smith';
const name = first + ' ' + last;
console.log('your full name is', name);

const fullname = `Your full name 
is ${first} ${last}`;   // line breaks allowed in string template
console.log(fullname);

