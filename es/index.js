import { store, PreMounter, attachReducers } from '@dolnpm/react-redux-init-app';

import snackMessage from './reducers/snack-message.js';
import snackErrorResponse from './reducers/snack-error-response.js';

export var infoSnack = void 0;

var flashes = {};
var snacks = [];

export function hide() {
    var snack = { open: false, type: 'none' };
    store.dispatch({ type: 'SNACK_MESSAGE', snack: snack });
}

export function dispatchSnack(snack, wait) {
    hide();
    setTimeout(function () {
        store.dispatch({ type: 'SNACK_MESSAGE', snack: snack });
    }, wait);
}

export function unSetInfoSnack() {
    infoSnack = null;
}

export function setInfoSnack(message) {
    infoSnack = { open: true, message: message, type: 'info' };
}

export function dispatchInfoSnack(wait) {
    infoSnack ? dispatchSnack(infoSnack, wait) : hide();
}

var cooldown = 7000;

export function extract() {
    for (var key in flashes) {
        snacks.push({
            type: key,
            message: flashes[key],
            open: true,
            duration: 6000
        });
    }
}

export function batch() {
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

export function attach(component, message) {
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

export function shouldDispatchInfoSnack(nextProps, props) {
    if (nextProps.snack === props.snack) {
        return false;
    }

    if (props.snack.type == 'alert') {
        setTimeout(function () {
            dispatchInfoSnack(300);
        }, props.snack.duration);
    }
}

export var mapStateToProps = function mapStateToProps(state) {
    var _ref2 = state.snack ? state.snack : { open: false, duration: 6000 },
        open = _ref2.open,
        duration = _ref2.duration;

    return {
        snack: state.snack,
        open: open,
        duration: duration
    };
};

export function initSnacks(infoHandle, flashHandle) {
    attachReducers({ 'SNACK_MESSAGE': snackMessage });

    var info = read(infoHandle);
    if (info) setInfoSnack(info);

    flashes = read(flashHandle);
    snacks = [];
    extract();
    PreMounter.add('batch', batch);
}

export { snackErrorResponse };