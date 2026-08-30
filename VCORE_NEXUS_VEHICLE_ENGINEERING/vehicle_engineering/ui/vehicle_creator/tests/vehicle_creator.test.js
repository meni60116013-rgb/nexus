'use strict';

const assert = require('assert');
const fs = require('fs');

const base =
  'vehicle_engineering/ui/vehicle_creator';

const index = fs.readFileSync(
  `${base}/index.html`,
  'utf8'
);

const css = fs.readFileSync(
  `${base}/styles.css`,
  'utf8'
);

const app = fs.readFileSync(
  `${base}/app.js`,
  'utf8'
);

assert(index.includes('Vehicle Creator'));
assert(index.includes('wheelbase'));
assert(index.includes('cgX'));
assert(index.includes('torque'));
assert(index.includes('calculate'));
assert(index.includes('export'));

assert(css.includes('.app'));
assert(css.includes('.card'));
assert(css.includes('@media'));

assert(app.includes('buildModel'));
assert(app.includes('localStorage'));
assert(app.includes('JSON.stringify'));
assert(app.includes('calculate'));

console.log('VEHICLE CREATOR UI TESTS: PASS');
