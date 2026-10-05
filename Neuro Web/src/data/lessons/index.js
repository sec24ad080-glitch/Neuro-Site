/**
 * NeuroLite Local Lesson Data
 * All lesson content is stored locally — no internet required.
 * Used by voice commands: "Start lesson", "Next lesson", "Previous lesson"
 */

export const SUBJECTS = ['math', 'english', 'science']

export const LESSONS = {
  math: [
    {
      id: 'math-1',
      subject: 'math',
      title: 'Counting to 10',
      emoji: '🔢',
      level: 1,
      content: `Let's count together! Numbers help us know how many things there are.
      
1 — One apple 🍎
2 — Two stars ⭐⭐
3 — Three balls 🟡🟡🟡
4 — Four cats 🐱🐱🐱🐱
5 — Five fingers on your hand ✋

Try counting the fingers on your hand right now! 
Count slowly: 1... 2... 3... 4... 5... 

Great job! Numbers go all the way up to 10. Can you count to 10?`,
      keyPoints: ['Numbers help us count things', 'Start from 1 and go up', 'Use your fingers to help count'],
      activity: 'Count 5 objects in the room around you!',
    },
    {
      id: 'math-2',
      subject: 'math',
      title: 'Addition (Adding Up)',
      emoji: '➕',
      level: 1,
      content: `Addition means putting things together to find out how many there are in total.

Example: You have 2 apples 🍎🍎
Someone gives you 3 more apples 🍎🍎🍎

Now how many apples do you have?
2 + 3 = 5 apples! 🎉

Tip: Hold up 2 fingers on one hand.
Then hold up 3 fingers on the other hand.
Count ALL your fingers — that's your answer!

Remember: When we ADD, the answer is BIGGER than what we started with.`,
      keyPoints: ['Addition puts numbers together', 'Use fingers or objects to help', 'The + sign means add'],
      activity: 'Try: 4 + 2 = ? Use your fingers!',
    },
    {
      id: 'math-3',
      subject: 'math',
      title: 'Subtraction (Taking Away)',
      emoji: '➖',
      level: 1,
      content: `Subtraction means taking things away to find out how many are left.

Example: You have 5 cookies 🍪🍪🍪🍪🍪
You eat 2 cookies 😋

How many cookies are left?
5 - 2 = 3 cookies!

Tip: Hold up 5 fingers.
Put down 2 fingers (fold them in).
Count the fingers still up — that's your answer!

Remember: When we SUBTRACT, the answer is SMALLER than what we started with.`,
      keyPoints: ['Subtraction takes numbers away', 'Use fingers or objects to help', 'The - sign means subtract'],
      activity: 'Try: 7 - 3 = ? Use your fingers!',
    },
    {
      id: 'math-4',
      subject: 'math',
      title: 'Shapes Around Us',
      emoji: '🔷',
      level: 1,
      content: `Shapes are everywhere! Let's learn the basic ones.

⭕ Circle — Round like a wheel, a coin, or the sun
🟥 Square — 4 equal sides, like a window or a box
🔷 Triangle — 3 sides, like a pizza slice or a mountain
⬛ Rectangle — Like a door or a book — 2 long sides, 2 short sides

Look around you right now — can you find a circle? A square? 

Shapes have sides and corners.
A triangle has 3 sides and 3 corners.
A square has 4 sides and 4 corners.`,
      keyPoints: ['Shapes have sides and corners', 'Circles are round — no corners!', 'Look for shapes around you'],
      activity: 'Draw a circle, square, and triangle on paper!',
    },
    {
      id: 'math-5',
      subject: 'math',
      title: 'Multiplication Basics',
      emoji: '✖️',
      level: 2,
      content: `Multiplication is fast addition! It means adding the same number many times.

Example: 3 × 4

That means: 4 + 4 + 4 (three groups of 4)
4... 8... 12 ✅

Think of it like this:
You have 3 bags 🎒🎒🎒
Each bag has 4 apples 🍎🍎🍎🍎
Total apples = 3 × 4 = 12 🍎

The × symbol means multiply.

Start with easy ones:
× 1 — anything times 1 is itself (5×1=5)
× 2 — just double the number (5×2=10)
× 10 — just add a zero (5×10=50)`,
      keyPoints: ['Multiplication is fast adding', 'Groups of the same number', '× means multiply'],
      activity: 'Try: 2 × 6 = ? Think of 2 groups of 6!',
    },
    {
      id: 'math-6',
      subject: 'math',
      title: 'Understanding Fractions',
      emoji: '🍕',
      level: 2,
      content: `A fraction is a part of a whole.

Think of a pizza 🍕
If you cut it into 4 equal slices and eat 1:
You ate 1 out of 4 pieces = 1/4 (one quarter)

The bottom number (4) = how many equal parts in total
The top number (1) = how many parts you have

Common fractions:
1/2 = One half (like half an apple)
1/4 = One quarter (like a quarter of a pizza)
3/4 = Three quarters (3 out of 4 pieces)

Key rule: All pieces must be EQUAL SIZE!`,
      keyPoints: ['Fraction = part of a whole', 'Bottom number = total pieces', 'Top number = your pieces'],
      activity: 'Fold a piece of paper in half. Each part is 1/2!',
    },
  ],

  english: [
    {
      id: 'eng-1',
      subject: 'english',
      title: 'The Alphabet',
      emoji: '🔤',
      level: 1,
      content: `The alphabet has 26 letters. Every word is made from these letters!

A B C D E F G H I J K L M
N O P Q R S T U V W X Y Z

There are two types:
VOWELS: A, E, I, O, U (5 vowels)
CONSONANTS: All the other 21 letters

Every word needs at least one vowel!
CAT = C-A-T (A is the vowel)
DOG = D-O-G (O is the vowel)
BIG = B-I-G (I is the vowel)

Try singing the ABC song to remember all 26 letters! 🎵`,
      keyPoints: ['26 letters in the alphabet', '5 vowels: A E I O U', 'Every word has at least one vowel'],
      activity: 'Sing the ABC song and point to each letter!',
    },
    {
      id: 'eng-2',
      subject: 'english',
      title: 'Reading Simple Words',
      emoji: '📖',
      level: 1,
      content: `Reading uses sounds! Each letter makes a sound.

Let's sound out simple words:

C-A-T → "kuh" + "aaa" + "tuh" = CAT 🐱
D-O-G → "duh" + "oh" + "guh" = DOG 🐶
S-U-N → "sss" + "uh" + "nnn" = SUN ☀️
B-E-D → "buh" + "eh" + "duh" = BED 🛏️

Steps to read a new word:
1. Look at each letter
2. Make the sound for each letter
3. Blend the sounds together
4. Say the whole word!

This is called PHONICS — it's how we learn to read! 📚`,
      keyPoints: ['Each letter makes a sound', 'Blend sounds together', 'Practice one word at a time'],
      activity: 'Try reading: HAT, PEN, BIG, CUP, RUN',
    },
    {
      id: 'eng-3',
      subject: 'english',
      title: 'Nouns — Naming Words',
      emoji: '🏷️',
      level: 1,
      content: `A noun is a naming word. It names a person, place, animal, or thing.

PEOPLE: girl, boy, teacher, doctor, mother
PLACES: school, park, home, hospital, beach
ANIMALS: cat, dog, bird, fish, elephant
THINGS: book, chair, apple, phone, ball

In a sentence:
"The DOG sat on the MAT."
DOG = noun (animal) | MAT = noun (thing)

Proper nouns are special names — they start with a CAPITAL letter!
Names of people: Priya, Ravi, Emma
Names of places: India, Chennai, London

Every sentence has at least one noun! 🏷️`,
      keyPoints: ['Noun = naming word', 'Person, place, animal, or thing', 'Proper nouns start with capitals'],
      activity: 'Look around the room — name 5 nouns you can see!',
    },
    {
      id: 'eng-4',
      subject: 'english',
      title: 'Verbs — Action Words',
      emoji: '⚡',
      level: 1,
      content: `A verb is an action word. It tells us what someone or something DOES.

Actions you can do:
run 🏃 | jump 🦘 | eat 🍽️ | sleep 😴 | read 📖 | write ✏️ | sing 🎵 | dance 💃

In sentences:
"The boy RUNS in the park." (RUNS = verb)
"She READS a book." (READS = verb)
"The dog BARKED loudly." (BARKED = verb)

Some verbs describe feelings or states:
love | like | want | need | feel | think | know

Every sentence MUST have a verb — it's the engine of the sentence! ⚡`,
      keyPoints: ['Verb = action or doing word', 'Every sentence needs a verb', 'Can be an action, feeling, or state'],
      activity: 'Act out 5 verbs: jump, clap, spin, wave, smile!',
    },
    {
      id: 'eng-5',
      subject: 'english',
      title: 'Sentences',
      emoji: '💬',
      level: 2,
      content: `A sentence is a complete thought that makes sense on its own.

Every sentence needs:
1. A NOUN (who or what)
2. A VERB (what they do)

Simple examples:
"Birds fly." — Birds (noun) + fly (verb) ✅
"The cat sleeps." — cat (noun) + sleeps (verb) ✅

Sentences always:
• Start with a CAPITAL letter
• End with a full stop (.) or question mark (?) or exclamation mark (!)

Types of sentences:
Statement: "I like apples." (telling something)
Question: "Do you like apples?" (asking something)
Exclamation: "That apple is delicious!" (strong feeling)`,
      keyPoints: ['Sentence = complete thought', 'Needs a noun and a verb', 'Start capital, end punctuation'],
      activity: 'Write 3 sentences about your favourite animal!',
    },
    {
      id: 'eng-6',
      subject: 'english',
      title: 'Adjectives — Describing Words',
      emoji: '🎨',
      level: 2,
      content: `An adjective describes a noun. It tells us MORE about a person, place, or thing.

Without adjective: "I have a dog."
With adjective: "I have a FLUFFY, BROWN dog." 🐶

Adjectives can describe:
SIZE: big, small, tiny, huge, tall, short
COLOUR: red, blue, green, golden, purple
SHAPE: round, square, flat, pointy
FEELING: happy, sad, angry, surprised, scared
TEXTURE: soft, hard, smooth, rough, fluffy

In sentences:
"The OLD man had a LONG, WHITE beard."
OLD, LONG, WHITE are all adjectives!

Adjectives make writing more interesting and clear! 🎨`,
      keyPoints: ['Adjective = describing word', 'Describes nouns', 'Makes writing more interesting'],
      activity: 'Describe your bedroom using 5 adjectives!',
    },
  ],

  science: [
    {
      id: 'sci-1',
      subject: 'science',
      title: 'Living and Non-Living Things',
      emoji: '🌿',
      level: 1,
      content: `Everything around us is either living or non-living.

LIVING THINGS can:
✅ Grow and change
✅ Breathe
✅ Eat food for energy
✅ Move (in some way)
✅ Have babies (reproduce)

Examples: plants 🌱, animals 🐾, humans 👤, trees 🌳

NON-LIVING THINGS:
❌ Don't grow
❌ Don't breathe
❌ Don't eat
❌ Don't have babies

Examples: rocks 🪨, chairs 🪑, water 💧, cars 🚗, books 📚

Is water living? 
No — water doesn't grow, breathe, or have babies!
But plants NEED water to live — that's different! 🌊`,
      keyPoints: ['Living things grow, breathe, and reproduce', 'Non-living things do not', 'Living things need food, water, and air'],
      activity: 'Look around you — list 5 living and 5 non-living things!',
    },
    {
      id: 'sci-2',
      subject: 'science',
      title: 'The Human Body',
      emoji: '🧠',
      level: 1,
      content: `Your body has amazing parts that all work together!

🧠 Brain — controls everything you think, feel, and do
❤️ Heart — pumps blood around your body (feel it beat!)
🫁 Lungs — breathe in air and give oxygen to your blood
🦷 Teeth — cut and chew your food before you swallow
👁️ Eyes — see colours, shapes, and movement
👂 Ears — hear sounds and help with balance
🦴 Bones — 206 bones give your body its shape (skeleton!)
💪 Muscles — pull on your bones so you can move

Your heart beats about 70 times every minute!
In one day it beats over 100,000 times! 🫀

Take care of your body — drink water, sleep well, eat healthy! 😊`,
      keyPoints: ['Body parts each have a job', 'Heart pumps blood', 'Bones give body its shape'],
      activity: 'Place your hand on your chest — feel your heartbeat!',
    },
    {
      id: 'sci-3',
      subject: 'science',
      title: 'Photosynthesis',
      emoji: '🌿',
      level: 2,
      content: `Plants make their own food using sunlight — this is called PHOTOSYNTHESIS!

Here's how it works:
☀️ Plant takes in SUNLIGHT through its leaves
💧 Plant drinks WATER through its roots
💨 Plant breathes in CO₂ (carbon dioxide) from the air

Then inside the leaf, magic happens:
Sunlight + Water + CO₂ → GLUCOSE (sugar food) + OXYGEN

The plant uses the glucose for energy to grow.
The oxygen is released into the air — which is what WE breathe! 🌬️

So plants help us breathe! 🌳💚

Chlorophyll is the green stuff in leaves that captures sunlight.
That's why leaves are green!`,
      keyPoints: ['Plants make food using sunlight', 'They need water and CO₂', 'They release oxygen for us to breathe'],
      activity: 'Put a plant in sunlight and in the dark — see which grows better!',
    },
    {
      id: 'sci-4',
      subject: 'science',
      title: 'The Water Cycle',
      emoji: '💧',
      level: 2,
      content: `Water moves in a big circle called the WATER CYCLE — it never stops!

Step 1: EVAPORATION ☀️
Heat from the sun turns water in rivers and oceans into water vapour (a gas).
The vapour rises up into the sky.

Step 2: CONDENSATION ☁️
High in the sky it's cold. The vapour cools and turns into tiny water droplets.
These droplets form CLOUDS.

Step 3: PRECIPITATION 🌧️
When clouds get heavy with water, it falls as rain, snow, or hail.

Step 4: COLLECTION 💧
Rain flows into rivers, lakes, and soaks into the ground.
Then the cycle starts again!

The same water has been on Earth for millions of years!
The water you drink may have been drunk by a dinosaur! 🦕`,
      keyPoints: ['Water evaporates, condenses, and falls as rain', 'Sun is the engine of the water cycle', 'Water is recycled continuously'],
      activity: 'Watch a glass of water left in the sun — the water level drops as it evaporates!',
    },
    {
      id: 'sci-5',
      subject: 'science',
      title: 'The Solar System',
      emoji: '🪐',
      level: 2,
      content: `Our solar system has the Sun at the centre, with 8 planets orbiting around it!

☀️ Sun — A giant star that gives light and heat

The 8 planets (in order from the Sun):
1. ☿ Mercury — smallest, closest to Sun, very hot and cold
2. ♀️ Venus — hottest planet, covered in thick clouds
3. 🌍 Earth — our home! Has water and life
4. ♂️ Mars — red planet, has the tallest volcano
5. ♃ Jupiter — biggest planet, has a giant storm
6. ♄ Saturn — has beautiful rings made of ice
7. ♅ Uranus — tilted on its side, very cold
8. ♆ Neptune — farthest away, windy and blue

Memory tip: "My Very Educated Mother Just Served Us Noodles"
(Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)`,
      keyPoints: ['8 planets orbit the Sun', 'Earth is the 3rd planet', 'Use the memory sentence to remember the order'],
      activity: 'Draw all 8 planets and label them with their names!',
    },
  ]
}

// Get all lessons as a flat list
export function getAllLessons() {
  return Object.values(LESSONS).flat()
}

// Get lessons for a specific subject
export function getLessonsBySubject(subject) {
  return LESSONS[subject.toLowerCase()] || []
}

// Get a lesson by ID
export function getLessonById(id) {
  return getAllLessons().find(l => l.id === id) || null
}

// Get the next lesson after a given lesson ID
export function getNextLesson(currentId) {
  const all = getAllLessons()
  const idx = all.findIndex(l => l.id === currentId)
  if (idx < 0 || idx >= all.length - 1) return null
  return all[idx + 1]
}

// Get the previous lesson before a given lesson ID
export function getPrevLesson(currentId) {
  const all = getAllLessons()
  const idx = all.findIndex(l => l.id === currentId)
  if (idx <= 0) return null
  return all[idx - 1]
}
