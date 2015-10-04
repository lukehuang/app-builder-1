'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.compose = compose;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function throwIfHasBeenCalled(fn) {
  if (fn._called) {
    throw new Error('Cannot call next more than once');
  }
  return fn._called = true;
}

function throwIfNotFunction(x) {
  if ('function' !== typeof x) {
    throw new TypeError(x + ', middleware must be a function');
  }
  return x;
}

function tryInvokeMiddleware(context, middleware, next) {
  try {
    return middleware ? Promise.resolve(middleware(context, next)) : Promise.resolve(context);
  } catch (error) {
    return Promise.reject(error);
  }
}

function middlewareReducer(composed, mw) {
  return function (context, nextFn) {
    var next = function next() {
      return throwIfHasBeenCalled(next) && composed(context, nextFn);
    };
    return composed !== tryInvokeMiddleware ? tryInvokeMiddleware(context, mw, next) : tryInvokeMiddleware(context, mw, next).then(function () {
      return context;
    });
  };
}

/**
 * Create a function to invoke all passed middleware functions
 * with a single argument and context
 * @param {...Array<Function>} middleware, groups of middleware functions
 * @return {Function} Invoke the middleware pipeline
 */

function compose() {
  var _ref;

  return (_ref = []).concat.apply(_ref, arguments).filter(throwIfNotFunction).reduceRight(middlewareReducer, tryInvokeMiddleware);
}

exports['default'] = function () {
  return new AppBuilder();
};

var AppBuilder = (function () {
  function AppBuilder() {
    _classCallCheck(this, AppBuilder);

    this.middleware = [];
  }

  _createClass(AppBuilder, [{
    key: 'build',
    value: function build() {
      if (!this.middleware.length) {
        throw new Error('Usage error: must have at least one middleware');
      }
      return compose(this.middleware);
    }
  }, {
    key: 'use',
    value: function use(mw) {
      this.middleware.push(throwIfNotFunction(mw));
      return this;
    }
  }]);

  return AppBuilder;
})();

exports.AppBuilder = AppBuilder;
