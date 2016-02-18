/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Set = require('./set')
  , path = require('path')
  , fs = require('fs');

/**
 * Expose the migrate function.
 */
var useCoffee = false

try {
  require('coffee-script/register');
  useCoffee = true
} catch (e) {}

exports = module.exports = migrate;

function migrate(title, up, down) {
  // migration
  if ('string' == typeof title && up && down) {
    migrate.set.addMigration(title, up, down);
  // specify migration file
  } else if ('string' == typeof title) {
    migrate.set = new Set(title);
  // no migration path
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations');
  // run migrations
  } else {
    return migrate.set;
  }
}

exports.load = function (stateFile, migrationsDirectory) {

  var set = new Set(stateFile);
  var dir = path.resolve(migrationsDirectory);

  fs.readdirSync(dir).filter(function(file){

    var regex = useCoffee ? /^\d+.*\.js|coffee$/ :  /^\d+.*\.js$/
    return file.match(regex);
  }).sort().forEach(function (file) {
    var mod;
    try {
      mod = require(path.join(dir, file));
    } catch(err) {
      mod = void 0;
    }
    if (mod) {
      set.addMigration(file, mod.up, mod.down);
    }
  });

  return set;
};
