module.exports = {
    name: 'ping',
    description: "this is a ping command!",
    execute(message, args) {

        // Pretty simple.
        message.channel.send("Pong!");

    }
}