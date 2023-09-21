const db = require('../db')
var CronJob = require('cron').CronJob

const time = '0 5 * * 0'

exports.setGoldenLlamaLocation = async () => {
    const job = new CronJob(
        time,
        async () => {
            console.log('running weekly golden llama job at: ' + new Date())

            let newIndex
            const today = new Date()
            today.setSeconds(0)
            today.setMilliseconds(0)
            const llama = await db.Llama.findOne()

            // make sure we don't get repeat locations
            while (!newIndex || newIndex === llama.goldenLlamaIndex) {
                newIndex = Math.floor(Math.random() * 17)
            }

            llama.goldenLlamaIndex = newIndex
            llama.previousGoldenLlamaUpdate = llama.lastGoldenLlamaUpdate
            llama.lastGoldenLlamaUpdate = today

            await llama.save()
            io.emit('new llama location', newIndex)
        },
        null,
        true
    )
    job.start()
}
