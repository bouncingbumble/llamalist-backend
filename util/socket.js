module.exports = initializeSocket = () => {
    global.ioConnections = []

    io.on('connection', async (socket) => {
        socket.on('newConnection', (userId) => {
            ioConnections.push({ socket: socket.id, user: userId })
        })

        socket.on('disconnect', () => {
            ioConnections = ioConnections.filter(
                (connection) => connection.socket !== socket.id
            )
        })
    })
}
