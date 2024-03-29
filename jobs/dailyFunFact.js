const db = require('../db')
var CronJob = require('cron').CronJob

const time = '0 5 * * *'
const scribbleSpeed = 40
const scribblePause = 500

exports.setDailyFunFact = async () => {
    const job = new CronJob(
        time,
        async () => {
            console.log('running daily fun fact job at: ' + new Date())
            const llama = await db.Llama.findOne()

            if (!llama.isCustomFunFact) {
                let newIndex = llama.funFactIndex + 1
                if (llama.funFactIndex >= funFacts.length - 1) {
                    newIndex = 0
                }
                const newFunFact = funFacts[newIndex]
                const { sequence, duration } =
                    getSequenceAndDuration(newFunFact)

                llama.funFactIndex = newIndex
                llama.funFactText = newFunFact
                llama.funFactSequence = sequence
                llama.funFactDuration = duration
                llama.funFactSpeed = scribbleSpeed
            } else {
                llama.isCustomFunFact = false
            }
            await llama.save()
            io.emit('new fun fact', {
                speed: scribbleSpeed,
                sequence: llama.funFactSequence,
                duration: llama.funFactDuration,
            })
        },
        null,
        true
    )
    job.start()
}

exports.setCustomFunFact = async (customFact) => {
    const llama = await db.Llama.findOne()

    const { sequence, duration } = getSequenceAndDuration(customFact)

    llama.isCustomFunFact = true
    llama.funFactText = customFact
    llama.funFactSequence = sequence
    llama.funFactDuration = duration
    llama.funFactSpeed = scribbleSpeed
    await llama.save()
}

exports.overrideCurrentFunFact = async (customFact) => {
    const llama = await db.Llama.findOne()

    const { sequence, duration } = getSequenceAndDuration(customFact)

    llama.funFactText = customFact
    llama.funFactSequence = sequence
    llama.funFactDuration = duration
    llama.funFactSpeed = scribbleSpeed
    await llama.save()

    io.emit('new fun fact', {
        sequence,
        duration,
        speed: scribbleSpeed,
    })
}

const getSequenceAndDuration = (funFact) => {
    const sequence = []

    for (let index = 0; index < funFact.length; index++) {
        const character = funFact.charAt(index)

        if (
            character === '?' ||
            character === '.' ||
            character === ',' ||
            character === '!' ||
            index === funFact.length - 1
        ) {
            const chunk = funFact.substring(0, index + 1)

            sequence.push(chunk)
            sequence.push(scribblePause)
        }
    }

    const duration =
        (scribblePause * sequence.length) / 2 + funFact.length * scribbleSpeed

    return { sequence, duration }
}

const funFacts = [
    'Llamas typically get along with one another. But when we get into an argument we will stick our tongues out at each other to express our discontent',
    'Did you know that a llama can spit green, partially digested food 15 feet or more?',
    'Know your limits! If you try to overload a llama with too much weight, we are likely to lie down or simply refuse to move. Be a llama, know your limits',
    'Llamas are vegetarians and have very efficient digestive systems. A healthy diet is a huge part of our day to day moods',
    'Llama Mia! Did you know that llamas have three stomachs? Make sure to keep me well fed!',
    'Did you know llamas can die of loneliness? Those of us bred in solitude typically experience low moods and subsequently have poor eating habits. Friends, family, and good food are key to our happiness!',
    'Did you know llama poop is a coveted resource? Llama farmers refer to our poo as "llama beans." It has no odor and makes for a great, eco-friendly fertilizer. Historically, the Incas in Peru burned dried llama poop for fuel.',
    'Did you know llamas can grow as much as 6 feet tall? Complete your goals to see how much I can grow!',
    'Llamas are very social animals, one of our favorite ways to communicate is by humming. mmmmmmmmmmmmmm:)',
    'Like dogs, llamas can be trained as therapy animals to work in hospitals and schools. Many say llamas have a "soothing aura."',
    'Scientists are studying llamas because we carry antibodies that are effective against every strain of the flu. One day there may not be a need for an annual flu shot thanks to me!',
    'Llamas have been walking around on earth for about 50 million years, long before you humans arrived',
    'We llamas are typically pacifists, but when we need to defend ourselves kicking is our primary weapon',
    'According to Aymara mythology, the "Heavenly Llama" drinks water from the ocean and provides rain from its urine',
    'Llamas make great pets. Make sure to feed me baskets of apples every day to keep me happy and strong',
    'Vroom vroom! Did you know that llamas can reach a top speed of 35 mph? Catch me if you can!',
    'Llamas have a social hierarchy similar to that of humans. Llamas that hiss, spit and fight are kept at the bottom of the social spectrum. One small fight can ruin our reputation. Always be polite!',
    "If you haven't already noticed, llamas love to communicate through twitches of our ears and tails. We're just saying hello!",
    'We llamas are very light on our feet. Despite weighing up to 450 pounds, our toes have less of an impact on the ground than human hikers!',
    "Llamas are very smart, but we haven't invented AC yet. So we travel to high altitudes to beat the heat!",
    'A baby llama is called a cria. Just like humans, mothers bond with their babies through nuzzling, cuddling, and nose to nose contact',
    'We llamas practice good hygiene. We even have a designated bathroom area!',
    "Llamas can be picky. Did you know we have a split upper lip to help us select the tastiest treats and avoid food we don't like?",
    "Putting off mowing your lawn? Llamas make for great lawn mowers. We chew on grass from the midpoint of the leaf blade instead of ripping it out from the root. It's a great way to take care of those pesky chores and keep me fed!",
    "Despite being very social animals, we also love our personal space. Don't forget to take some time to yourself and recharge",
    'From the tropcis to high altitude mountain ranges, llamas can survive in any climate. All we need is food, space, and good company',
    "Llamas make for great pack animals. We can carry heavy weights over long distances. But don't push us too hard. We have been known to just lie donw and give up in the middle of a trek due to exhaustion, leaving you stranded in the middle of the Andes",
    'Did you know female llamas like to go to the bathroom together? They form a line and each take their turn in the "bathroom"',
    "Llama wool is light weight, warm, and does not retain water. Some humans believe our wool is more useful than sheep's! I sure think so",
    'Llamas are not Alpacas! But they are our family. If you want to tell the difference, llamas are generally twice the size and we have bigger ears that stand straight up.',
    "If you ever see a drink labeled Kuzco's poison, DO NOT DRINK IT!",
]
