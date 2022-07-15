export default {
    curRoom : state => {
        return state.loadedRooms.find(r => r.roomId === state.roomId)
    }
}
