export default (state, action) => {
    const snackbar = {
        type: 'alert',
        message: action.payload.message,
        open: true
    }
    return {
        ...state,
        snack: snackbar
    }
}