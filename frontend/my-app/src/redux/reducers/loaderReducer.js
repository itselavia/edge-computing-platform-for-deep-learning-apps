export function interceptor(state = {}, action) {
    const { type } = action;
    const matches = /(.*)_(REQUEST|SUCCESS|FAILURE)/.exec(type);
    console.log("loader reducer")
    // not a *_REQUEST / *_SUCCESS /  *_FAILURE actions, so we ignore them
    if (!matches) return state;
    
    const [, requestName, requestState] = matches;
    
    return {
        ...state,
        ['requestType']: requestState === 'REQUEST'
    }

};