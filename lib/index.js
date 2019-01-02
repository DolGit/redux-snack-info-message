'use strict';

exports.__esModule = true;
exports.snackErrorResponse = exports.mapStateToProps = exports.infoSnack = undefined;
exports.hide = hide;
exports.dispatchSnack = dispatchSnack;
exports.unSetInfoSnack = unSetInfoSnack;
exports.setInfoSnack = setInfoSnack;
exports.dispatchInfoSnack = dispatchInfoSnack;
exports.extract = extract;
exports.batch = batch;
exports.attach = attach;
exports.shouldDispatchInfoSnack = shouldDispatchInfoSnack;
exports.initSnacks = initSnacks;

var _reactReduxInitApp = require('@dolnpm/react-redux-init-app');

var _snackMessage = require('./reducers/snack-message.js');

var _snackMessage2 = _interopRequireDefault(_snackMessage);

var _snackErrorResponse = require('./reducers/snack-error-response.js');

var _snackErrorResponse2 = _interopRequireDefault(_snackErrorResponse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var infoSnack = exports.infoSnack = void 0;

var flashes = {};
var snacks = [];

function hide() {
    var snack = { open: false, type: 'none' };
    _reactReduxInitApp.store.dispatch({ type: 'SNACK_MESSAGE', snack: snack });
}

function dispatchSnack(snack, wait) {
    hide();
    setTimeout(function () {
        _reactReduxInitApp.store.dispatch({ type: 'SNACK_MESSAGE', snack: snack });
    }, wait);
}

function unSetInfoSnack() {
    exports.infoSnack = infoSnack = null;
}

function setInfoSnack(message) {
    exports.infoSnack = infoSnack = { open: true, message: message, type: 'info' };
}

function dispatchInfoSnack(wait) {
    infoSnack ? dispatchSnack(infoSnack, wait) : hide();
}

var cooldown = 7000;

function extract() {
    for (var key in flashes) {
        snacks.push({
            type: key,
            message: flashes[key],
            open: true,
            duration: 6000
        });
    }
}

function batch() {
    var wait = -300;
    var buffer = 300;
    for (var _iterator = snacks, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var snack = _ref;

        wait = wait + buffer;
        dispatchSnack(snack, wait);
        wait = wait + cooldown;
    }
    if (wait < 0) wait = 0;
    dispatchInfoSnack(wait);
}

function attach(component, message) {
    if (!message.length) return false;

    var onMount = component.componentDidMount;
    component.componentDidMount = function () {
        if (onMount) onMount();
        setInfoSnack(message);
        dispatchInfoSnack(300);
    };

    var onUnMount = component.componentWillUnmount;
    component.componentWillUnmount = function () {
        if (onUnMount) onUnMount();
        hide();
        setTimeout(function () {
            unSetInfoSnack();
        }, 300);
    };
}

var read = function read(handle) {
    var el = document.getElementById(handle);
    if (el) {
        var data = el.getAttribute('data');
        if (data) return JSON.parse(data);
    }
};

function shouldDispatchInfoSnack(nextProps, props) {
    if (nextProps.snack === props.snack) {
        return false;
    }

    if (props.snack.type == 'alert') {
        setTimeout(function () {
            dispatchInfoSnack(300);
        }, props.snack.duration);
    }
}

var mapStateToProps = exports.mapStateToProps = function mapStateToProps(state) {
    var _ref2 = state.snack ? state.snack : { open: false, duration: 6000 },
        open = _ref2.open,
        duration = _ref2.duration;

    return {
        snack: state.snack,
        open: open,
        duration: duration
    };
};

function initSnacks(infoHandle, flashHandle) {
    (0, _reactReduxInitApp.attachReducers)({ 'SNACK_MESSAGE': _snackMessage2.default });

    var info = read(infoHandle);
    if (info) setInfoSnack(info);

    flashes = read(flashHandle);
    snacks = [];
    extract();
    _reactReduxInitApp.PreMounter.add('batch', batch);
}

exports.snackErrorResponse = _snackErrorResponse2.default;