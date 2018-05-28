import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()

export const runSaga = sagaMiddleware.run
export default sagaMiddleware
