import { SubscribePureActions } from '../pure'
import { SubscribeRequests } from '../requests'

export default class SubscribeThunks {

    static subscribe(email){
        return dispatch => {
            dispatch(SubscribePureActions.subscribeRequest(email))
            return SubscribeRequests.subscribe({email}).then(response => {
                if (response.status == 200) {
                    dispatch(SubscribePureActions.subscribeSuccess(email))
                } else {
                    response.json().then(json => {
                        dispatch(SubscribePureActions.subscribeError(email, response.status, json.message))
                    })
                }
            })
        }
    }

}