export default (state, action) => {
    return {
        ...state,
        snack: action.snack,
    }
}