export default {
    curRoom : state => {
        return state.loadedRooms.find(r => r.roomId === state.roomId)
    },
    haveFileDownloading: state => {
        return !!state.downloadItemList.find(r => r.state === 'ing')
    }
}
