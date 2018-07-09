import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'

const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware()

export default sagaMiddleware
