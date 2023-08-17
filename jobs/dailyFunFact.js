const db = require('../db')
var CronJob = require('cron').CronJob

const time = '* * * * *'

exports.getDailyFunFact = async () => {
    const job = new CronJob(
        time,
        async () => {
            console.log('running daily fun fact job at: ' + new Date())
            const funFact = await db.FunFact.findOne()

            if (!funFact.isCustom) {
                let newIndex = funFact.index + 1
                if (funFact.index >= funFacts.length - 1) {
                    newIndex = 0
                }
                const newFunFact = funFacts[newIndex]

                funFact.index = newIndex
                funFact.funFact = newFunFact
            } else {
                funFact.isCustom = false
            }
            await funFact.save()
            io.emit('new fun fact', { data: funFact.funFact })
        },
        null,
        true
    )
    job.start()
}

exports.setCustomFunFact = async (customFact) => {
    const funFact = await db.FunFact.findOne()

    funFact.isCustom = true
    funFact.funFact = customFact
    await funFact.save()
}

exports.overrideCurrentFunFact = async (customFact) => {
    const funFact = await db.FunFact.findOne()

    funFact.funFact = customFact
    await funFact.save()

    io.emit('new fun fact', { data: customFact })
}

const funFacts = [
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #1',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #2',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #3',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #4',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #5',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #6',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #7',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #8',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #9',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #10',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #11',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #12',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #13',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #14',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #15',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #16',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #17',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #18',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #19',
    'Am I a cool fun fact? Yes I am indeed a cool fun fact. I am fun fact #20',
]
