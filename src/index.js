import {store, PreMounter, attachReducers} from '@dolnpm/react-redux-init-app'

import snackMessage from './reducers/snack-message.js'
import snackErrorResponse from './reducers/snack-error-response.js'

export let infoSnack;

let flashes = {}
let snacks = []

export function hide() {
    const snack = {open: false, type: 'none'}
    store.dispatch({type: 'SNACK_MESSAGE', snack})
}

export function dispatchSnack(snack, wait) {
    hide()
    setTimeout(() => {
        store.dispatch({type: 'SNACK_MESSAGE', snack})
    }, wait)
}

export function unSetInfoSnack() {
    infoSnack = null
}

export function setInfoSnack(message) {
    infoSnack = {open: true, message, type: 'info'}
}

export function dispatchInfoSnack(wait) {
    infoSnack ? dispatchSnack(infoSnack, wait) : hide()
}

const cooldown = 7000

export function extract() {
    for (let key in flashes) {
        snacks.push({
            type: key,
            message: flashes[key],
            open: true,
            duration: 6000
        })
    }
}

export function batch() {
    let wait = -300
    let buffer = 300
    for (let snack of snacks) {
        wait = wait + buffer
        dispatchSnack(snack, wait)
        wait = wait + cooldown
    }
    if (wait < 0) wait = 0
    dispatchInfoSnack(wait)
}


export function attach(component, message) {
    if (!message.length) return false

    const onMount = component.componentDidMount
    component.componentDidMount = () => {
        if (onMount) onMount()
        setInfoSnack(message)
        dispatchInfoSnack(300)
    }

    const onUnMount = component.componentWillUnmount
    component.componentWillUnmount = () => {
        if (onUnMount) onUnMount()
        hide()
        setTimeout(() => {
            unSetInfoSnack()
        }, 300)
    }
}

const read = (handle) => {
    const el = document.getElementById(handle)
    if (el) {
        const data = el.getAttribute('data')
        if (data) return JSON.parse(data)
    }
}

export function shouldDispatchInfoSnack(nextProps, props) {
    if (nextProps.snack === props.snack) {
        return false
    }

    if (props.snack.type == 'alert') {
        setTimeout(() => {
            dispatchInfoSnack(300)
        }, props.snack.duration)
    }
}

export const mapStateToProps = state => {
    const {open, duration} = state.snack ? state.snack : {open: false, duration: 6000}
    return {
        snack: state.snack,
        open,
        duration
    }
};

export function initSnacks(infoHandle, flashHandle) {
    attachReducers({'SNACK_MESSAGE': snackMessage})

    const info = read(infoHandle)
    if (info) setInfoSnack(info)

    flashes = read(flashHandle)
    snacks = []
    extract()
    PreMounter.add('batch', batch)
}

export {snackErrorResponse}

