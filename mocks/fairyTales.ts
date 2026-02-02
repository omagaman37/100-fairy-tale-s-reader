export interface FairyTale {
  id: string;
  title: string;
  author: string;
  category: string;
  duration: string;
  coverImage: string;
  summary: string;
  content: string;
}

const storyImages = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
  'https://images.unsplash.com/photo-1518173946687-a4c036bc3d9f?w=400',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400',
  'https://images.unsplash.com/photo-1476842634003-7dcca8f832de?w=400',
  'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=400',
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
];

const categories = ['Classic', 'Adventure', 'Magic', 'Animals', 'Princesses', 'Nature', 'Friendship', 'Dreams'];

const classicTales: Partial<FairyTale>[] = [
  {
    title: 'Cinderella',
    author: 'Charles Perrault',
    summary: 'A kind girl finds her prince with the help of a fairy godmother.',
    content: `Once upon a time, there lived a young girl named Cinderella. She was kind and gentle, but her stepmother and stepsisters treated her cruelly, making her do all the housework.

One day, an invitation arrived for a grand ball at the palace. The prince was looking for a bride! Cinderella's stepsisters prepared excitedly, but poor Cinderella was told she could not go.

As she sat crying in the garden, a magical light appeared. It was her Fairy Godmother! With a wave of her wand, she transformed a pumpkin into a golden coach, mice into horses, and Cinderella's rags into a beautiful ball gown with glass slippers.

"You must return before midnight," warned the Fairy Godmother, "for the magic will end then."

At the ball, the prince was enchanted by Cinderella. They danced all night, but as the clock struck midnight, Cinderella fled, leaving behind only a glass slipper.

The prince searched the entire kingdom for the girl whose foot fit the slipper. When he arrived at Cinderella's home, the stepsisters tried to squeeze into the tiny shoe, but it was Cinderella whose foot fit perfectly.

The prince recognized her at once, and they were married. Cinderella forgave her stepsisters, and they all lived happily ever after.`,
  },
  {
    title: 'Snow White',
    author: 'Brothers Grimm',
    summary: 'A princess escapes an evil queen and finds friends in the forest.',
    content: `Once upon a time, in a kingdom far away, there lived a princess named Snow White. She had skin as white as snow, lips as red as roses, and hair as black as ebony.

The Queen, Snow White's stepmother, was beautiful but vain. Every day she asked her magic mirror, "Mirror, mirror on the wall, who is the fairest of them all?" And the mirror always replied, "You, my Queen."

But one day, when Snow White had grown into a young woman, the mirror said, "Snow White is the fairest of them all."

The jealous Queen ordered a huntsman to take Snow White into the forest and never bring her back. But the kind huntsman could not harm the innocent princess. He told her to run away and hide.

Deep in the forest, Snow White discovered a tiny cottage belonging to seven dwarfs. They welcomed her, and she kept house for them in return.

But the evil Queen discovered Snow White was alive. Disguising herself as an old woman, she offered Snow White a poisoned apple. One bite, and Snow White fell into a death-like sleep.

The dwarfs placed her in a glass coffin. One day, a prince riding through the forest saw her and fell in love. He kissed her gently, and the spell was broken.

Snow White awoke, and she and the prince were married. They invited the seven dwarfs to live at the castle, and everyone lived happily ever after.`,
  },
  {
    title: 'Sleeping Beauty',
    author: 'Charles Perrault',
    summary: 'A princess cursed to sleep for 100 years awaits true love\'s kiss.',
    content: `Long ago, a king and queen had a beautiful daughter. They invited all the fairies in the kingdom to her christening, but they forgot one - the wicked fairy Maleficent.

Each fairy gave the princess a gift - beauty, grace, and a voice like a nightingale. But before the last fairy could speak, Maleficent appeared. "The princess shall prick her finger on a spindle and die!" she cursed.

The last fairy softened the curse: "She shall not die, but sleep for one hundred years, until awakened by true love's kiss."

The king ordered all spindles destroyed, but on her sixteenth birthday, the princess found a hidden tower with an old woman spinning. Curious, she touched the spindle and fell into a deep sleep.

The entire castle fell asleep with her. A forest of thorns grew around it, and the kingdom waited.

One hundred years later, a brave prince heard the legend of the sleeping princess. He cut through the thorns and found her in the tower. Her beauty took his breath away.

He leaned down and kissed her gently. The princess's eyes fluttered open. "I have waited so long for you," she whispered.

The entire castle awoke. The prince and princess were married, and they lived happily ever after.`,
  },
  {
    title: 'Little Red Riding Hood',
    author: 'Brothers Grimm',
    summary: 'A girl in a red hood learns an important lesson about strangers.',
    content: `Once upon a time, there was a sweet little girl who always wore a red velvet hood. Everyone called her Little Red Riding Hood.

One day, her mother asked her to take some food to her sick grandmother who lived in the forest. "Stay on the path and don't talk to strangers," her mother warned.

As Red Riding Hood walked through the forest, a wolf approached her. "Where are you going, little girl?" he asked sweetly.

"To grandmother's house," Red Riding Hood replied, forgetting her mother's warning.

The cunning wolf ran ahead to grandmother's house. He locked the grandmother in a closet, put on her nightgown and cap, and climbed into her bed.

When Red Riding Hood arrived, something seemed different. "Grandmother, what big eyes you have!" she said.

"The better to see you with," replied the wolf.

"What big ears you have!"

"The better to hear you with."

"What big teeth you have!"

"The better to eat you with!" The wolf leaped out of bed!

Just then, a brave woodcutter burst through the door. He had heard Red Riding Hood's scream. He chased the wolf away and freed grandmother from the closet.

Red Riding Hood learned to always listen to her mother and never talk to strangers again.`,
  },
  {
    title: 'Hansel and Gretel',
    author: 'Brothers Grimm',
    summary: 'Two siblings outsmart a wicked witch in a house made of candy.',
    content: `Near a great forest lived a poor woodcutter with his wife and two children, Hansel and Gretel. Times were hard, and the cruel stepmother convinced the woodcutter to abandon the children in the forest.

Clever Hansel had overheard the plan. The first time, he dropped white pebbles to find their way home. But the second time, he could only drop breadcrumbs, which the birds ate.

Lost and hungry, the children wandered until they found a house made entirely of gingerbread, cake, and candy! As they nibbled on the walls, an old woman appeared. She seemed kind and invited them in.

But the woman was a wicked witch! She locked Hansel in a cage and made Gretel cook to fatten him up for eating.

Days passed. The witch grew impatient. "Today I will bake you both!" she cackled, heating the oven.

"I don't know how to check if it's hot enough," said clever Gretel.

"Foolish child! Like this!" The witch stuck her head in the oven. Quick as lightning, Gretel pushed her in and slammed the door shut.

Gretel freed Hansel. They found the witch's treasure and took it home. Their father, who had deeply regretted abandoning them, welcomed them with tears of joy. The stepmother had died, and the family lived happily and never went hungry again.`,
  },
  {
    title: 'Rapunzel',
    author: 'Brothers Grimm',
    summary: 'A girl with magical long hair is rescued from a tower by a prince.',
    content: `Once there was a couple who longed for a child. The wife craved the rapunzel lettuce from the witch's garden next door. When caught stealing it, the husband had to promise their firstborn child to the witch.

When the baby girl was born, the witch took her and named her Rapunzel. She grew into a beautiful maiden with golden hair that grew and grew until it was twenty feet long.

The witch locked Rapunzel in a tall tower with no door or stairs. To visit, she would call, "Rapunzel, Rapunzel, let down your hair!" And Rapunzel would lower her braid for the witch to climb.

One day, a prince heard Rapunzel singing. He watched the witch and learned her trick. When she left, he called out the same words. Rapunzel let down her hair, and the prince climbed up.

They fell in love. The prince visited often, and they planned her escape. But the witch discovered their secret. In rage, she cut Rapunzel's hair and banished her to a distant land.

When the prince came again, the witch let down the cut hair. The prince climbed up only to find the witch. She pushed him from the tower, and thorns blinded him.

For years, the blind prince wandered until he heard a familiar voice singing. It was Rapunzel! Her tears of joy fell on his eyes and healed them.

Together at last, they returned to his kingdom and lived happily ever after.`,
  },
  {
    title: 'The Frog Prince',
    author: 'Brothers Grimm',
    summary: 'A princess learns that kindness can transform even a frog.',
    content: `In a kingdom long ago, there lived a spoiled princess who loved her golden ball more than anything. One day, while playing by the pond, her ball fell into the deep water.

A frog appeared. "I will get your ball," he croaked, "if you promise to be my friend, let me eat from your plate, and sleep on your pillow."

"Yes, yes, anything!" cried the princess. The frog retrieved her ball, but the princess grabbed it and ran away, forgetting her promise.

That evening, there was a knock at the castle door. The frog had come to claim her promise! The king made his daughter keep her word. Disgusted, she let the frog eat from her plate.

When bedtime came, the frog asked to sleep on her pillow. The princess was so angry that she threw him against the wall.

But instead of a splat, there was a flash of light! The frog transformed into a handsome prince. A witch had cursed him, and only the princess could break the spell.

The princess felt ashamed of her behavior. She apologized sincerely, and they became true friends. As the years passed, their friendship grew into love.

They were married, and the princess learned that kindness and keeping promises were more valuable than golden balls or pretty dresses. They lived happily ever after.`,
  },
  {
    title: 'Jack and the Beanstalk',
    author: 'English Folklore',
    summary: 'A boy climbs a magical beanstalk to find adventure in the clouds.',
    content: `Jack lived with his poor mother. Their only possession was a cow. When the cow stopped giving milk, Jack's mother told him to sell it at the market.

On the way, Jack met an old man who offered magic beans for the cow. Jack made the trade, but his mother was furious and threw the beans out the window.

By morning, an enormous beanstalk had grown up through the clouds! Curious Jack climbed up and found a land above the sky with a giant's castle.

Inside lived a fearsome giant and his wife. The giant had a hen that laid golden eggs and a magic harp that played by itself. Jack hid while the giant ate his breakfast.

"Fee-fi-fo-fum, I smell the blood of an Englishman!" roared the giant. But his wife convinced him he was imagining things, and soon the giant fell asleep.

Jack grabbed the hen and hurried down the beanstalk. The giant followed! Jack called to his mother for an axe and chopped down the beanstalk. The giant fell with a tremendous crash.

With the hen's golden eggs, Jack and his mother were never poor again. Some say Jack climbed back up for more adventures, but that's another story. They lived happily ever after.`,
  },
  {
    title: 'The Ugly Duckling',
    author: 'Hans Christian Andersen',
    summary: 'A lonely duckling discovers its true beautiful self.',
    content: `On a farm, a mother duck sat on her eggs. One by one, adorable yellow ducklings hatched. But the last egg was larger, and out came a gray, awkward bird.

"What an ugly duckling!" everyone said. The other animals laughed and pecked at him. Even his siblings were unkind. Heartbroken, the ugly duckling ran away.

Through summer, autumn, and winter, the ugly duckling wandered alone. He nearly froze in the ice, but a kind farmer saved him. Still, the farmer's children frightened him, and he fled again.

One spring day, he saw the most beautiful birds he had ever seen - swans! They were graceful and white. "They will chase me away like everyone else," he thought sadly.

But when he bowed his head in shame, he saw his reflection in the water. He was no longer gray and awkward. He had grown into a beautiful swan!

The other swans welcomed him warmly. Children on the shore pointed and cheered, "Look at the beautiful new swan! He's the most beautiful of all!"

The swan who had once been an ugly duckling rustled his feathers with joy. He had found where he belonged. He had been a swan all along, just waiting to become who he was meant to be.`,
  },
  {
    title: 'The Little Mermaid',
    author: 'Hans Christian Andersen',
    summary: 'A mermaid gives up everything for the prince she loves.',
    content: `Deep beneath the ocean lived the Sea King and his six mermaid daughters. The youngest was the most beautiful and had the sweetest voice. She dreamed of the world above the waves.

On her fifteenth birthday, she was allowed to swim to the surface. There she saw a ship and a handsome prince. A storm arose, and she saved him from drowning, leaving him safely on shore.

She fell deeply in love but couldn't forget she was a mermaid. She visited the Sea Witch, who offered her human legs in exchange for her beautiful voice. "But," warned the witch, "if the prince marries another, you will turn into sea foam."

The little mermaid agreed. She drank the potion and felt terrible pain as her tail became legs. She couldn't speak, but the prince found her and was enchanted by her grace and beauty.

They became close friends. The little mermaid danced for the prince, though every step felt like walking on knives. She loved him with all her heart.

But the prince believed another princess had saved him. He married her, and the little mermaid's heart broke.

Her sisters came with a knife from the witch - if she killed the prince, she could become a mermaid again. But she could not harm him. At dawn, she threw herself into the sea.

Instead of becoming foam, her love transformed her into a spirit of the air, earning the chance to gain an immortal soul through good deeds.`,
  },
];

const generateStoryContent = (title: string, theme: string): string => {
  const openings = [
    'Once upon a time, in a land far, far away',
    'Long ago, in a magical kingdom',
    'In the days of old, when magic was real',
    'Beyond the mountains and across the sea',
    'In a time before time was counted',
  ];

  const middles = [
    'The journey was long and filled with wonder. Along the way, there were challenges to overcome and friends to make.',
    'Days turned to weeks as the adventure continued. Each new dawn brought new possibilities and magical encounters.',
    'Through forests enchanted and rivers that sang, the path wound ever onward toward destiny.',
    'The magic grew stronger with each passing moment, guiding the way through darkness and light.',
    'With courage in heart and hope as a compass, every obstacle became a stepping stone.',
  ];

  const endings = [
    'And so, with love and courage, they found their happily ever after. The kingdom celebrated for seven days and seven nights.',
    'From that day forward, peace and joy filled the land. And if they have not stopped celebrating, they are celebrating still.',
    'The magic never faded, and the love only grew stronger with each passing year. And they lived happily ever after.',
    'Thus ends our tale, but the magic lives on in the hearts of all who believe. And they all lived happily ever after.',
    'And so the story ends, but the adventure continues in dreams. May you find your own magic, dear reader.',
  ];

  const opening = openings[Math.floor(Math.random() * openings.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const ending = endings[Math.floor(Math.random() * endings.length)];

  return `${opening}, there lived ${theme}.

${middle}

There were moments of doubt and fear, but true hearts never wavered. Friends old and new joined together, and the power of kindness proved stronger than any darkness.

${middle}

The lesson learned was precious: that courage, love, and friendship can overcome any obstacle. ${theme} discovered that the greatest treasure was not gold or jewels, but the bonds formed along the way.

${ending}`;
};

const additionalTales: Partial<FairyTale>[] = [
  { title: 'Beauty and the Beast', author: 'Gabrielle-Suzanne Barbot de Villeneuve', category: 'Classic', summary: 'A young woman discovers that true beauty lies within.' },
  { title: 'Thumbelina', author: 'Hans Christian Andersen', category: 'Magic', summary: 'A tiny girl born from a flower seeks her place in the world.' },
  { title: 'The Princess and the Pea', author: 'Hans Christian Andersen', category: 'Princesses', summary: 'A prince finds his true princess in an unexpected way.' },
  { title: 'Puss in Boots', author: 'Charles Perrault', category: 'Animals', summary: 'A clever cat helps his master win fortune and love.' },
  { title: 'Rumpelstiltskin', author: 'Brothers Grimm', category: 'Magic', summary: 'A miller\'s daughter must guess a magical imp\'s name.', content: `Once upon a time, there lived a poor miller who had a beautiful daughter. One day, the miller boasted to the king that his daughter could spin straw into gold.

The greedy king summoned the girl to his castle. He locked her in a room filled with straw and a spinning wheel. "Spin this straw into gold by morning, or you shall die," he commanded.

The poor girl wept, for she had no such power. Suddenly, a strange little man appeared. "What will you give me if I spin it for you?" he asked.

"My necklace," she replied. The little man took it and sat at the wheel. By morning, the room glittered with gold.

But the king wanted more. He put her in a larger room with even more straw. Again the little man appeared. This time she gave him her ring, and again he spun the straw into gold.

The third night, the king promised to make her his queen if she succeeded. But she had nothing left to give. "Then promise me your firstborn child," said the little man. Desperate, she agreed.

She became queen, and a year later, a beautiful baby was born. The little man returned to claim his prize. The queen wept and begged. "Very well," he said. "I will give you three days. If you can guess my name, you may keep your child."

The queen sent messengers across the land to collect names. She guessed every name she knew, but none were right.

On the third day, a messenger reported seeing a strange little man dancing around a fire, singing: "Tonight tonight, my plans I make, tomorrow tomorrow, the baby I take. The queen will never win the game, for Rumpelstiltskin is my name!"

When the little man came, the queen pretended to guess wrong. "Is it Tom? Is it Harry?" Finally she said, "Could it be... Rumpelstiltskin?"

The little man flew into a rage. "A witch told you! A witch told you!" he screamed. He stamped his foot so hard that he fell right through the floor and was never seen again.

The queen kept her child, and they lived happily ever after.` },
  { title: 'The Snow Queen', author: 'Hans Christian Andersen', category: 'Adventure', summary: 'A girl journeys to the ends of the earth to save her friend.' },
  { title: 'The Twelve Dancing Princesses', author: 'Brothers Grimm', category: 'Princesses', summary: 'A soldier discovers the secret of twelve dancing princesses.' },
  { title: 'The Brave Little Tailor', author: 'Brothers Grimm', category: 'Adventure', summary: 'A tailor\'s boast leads him on an incredible adventure.' },
  { title: 'The Golden Goose', author: 'Brothers Grimm', category: 'Magic', summary: 'A kind boy\'s golden goose brings laughter to a princess.' },
  { title: 'The Elves and the Shoemaker', author: 'Brothers Grimm', category: 'Magic', summary: 'Magical elves help a poor shoemaker in secret.' },
  { title: 'The Bremen Town Musicians', author: 'Brothers Grimm', category: 'Animals', summary: 'Four animals set out to become musicians in Bremen.' },
  { title: 'The Wild Swans', author: 'Hans Christian Andersen', category: 'Magic', summary: 'A princess must save her brothers from an evil curse.' },
  { title: 'The Tinderbox', author: 'Hans Christian Andersen', category: 'Adventure', summary: 'A soldier finds a magical tinderbox with three dogs.' },
  { title: 'The Steadfast Tin Soldier', author: 'Hans Christian Andersen', category: 'Adventure', summary: 'A one-legged tin soldier\'s love for a paper dancer.' },
  { title: 'The Emperor\'s New Clothes', author: 'Hans Christian Andersen', category: 'Classic', summary: 'Two swindlers teach an emperor about vanity.' },
  { title: 'The Red Shoes', author: 'Hans Christian Andersen', category: 'Magic', summary: 'A girl learns the price of vanity through magic shoes.' },
  { title: 'The Nightingale', author: 'Hans Christian Andersen', category: 'Animals', summary: 'An emperor discovers the value of a real nightingale.' },
  { title: 'East of the Sun, West of the Moon', author: 'Norwegian Folklore', category: 'Adventure', summary: 'A girl journeys to find her enchanted prince.' },
  { title: 'The Six Swans', author: 'Brothers Grimm', category: 'Magic', summary: 'A sister works in silence to save her swan brothers.' },
  { title: 'The Fisherman and His Wife', author: 'Brothers Grimm', category: 'Classic', summary: 'A magical fish grants wishes that go too far.' },
  { title: 'Mother Holle', author: 'Brothers Grimm', category: 'Magic', summary: 'Two sisters find very different fates with Mother Holle.' },
  { title: 'The Star Money', author: 'Brothers Grimm', category: 'Magic', summary: 'A generous girl is rewarded with stars turned to gold.' },
  { title: 'The Three Little Pigs', author: 'English Folklore', category: 'Animals', summary: 'Three pigs build houses and outsmart a hungry wolf.' },
  { title: 'Goldilocks and the Three Bears', author: 'Robert Southey', category: 'Animals', summary: 'A curious girl explores the home of three bears.' },
  { title: 'The Tortoise and the Hare', author: 'Aesop', category: 'Animals', summary: 'A slow tortoise proves that steady wins the race.' },
  { title: 'The Ant and the Grasshopper', author: 'Aesop', category: 'Animals', summary: 'An ant prepares while a grasshopper plays.' },
  { title: 'The Lion and the Mouse', author: 'Aesop', category: 'Animals', summary: 'A tiny mouse saves a mighty lion.' },
  { title: 'The Boy Who Cried Wolf', author: 'Aesop', category: 'Classic', summary: 'A shepherd boy learns the importance of honesty.' },
  { title: 'The Town Mouse and Country Mouse', author: 'Aesop', category: 'Animals', summary: 'Two mice discover different lifestyles.' },
  { title: 'The Gingerbread Man', author: 'English Folklore', category: 'Adventure', summary: 'A cookie runs away from everyone who wants to eat him.' },
  { title: 'The Princess and the Frog', author: 'Brothers Grimm', category: 'Princesses', summary: 'A princess learns to keep her promises.' },
  { title: 'Bluebeard', author: 'Charles Perrault', category: 'Classic', summary: 'A wife discovers her husband\'s dark secret.' },
  { title: 'Tom Thumb', author: 'English Folklore', category: 'Adventure', summary: 'A tiny boy has enormous adventures.' },
  { title: 'The Pied Piper of Hamelin', author: 'German Legend', category: 'Magic', summary: 'A magical piper rids a town of rats.' },
  { title: 'The Happy Prince', author: 'Oscar Wilde', category: 'Friendship', summary: 'A statue and a swallow help the poor.' },
  { title: 'The Selfish Giant', author: 'Oscar Wilde', category: 'Magic', summary: 'A giant learns the joy of sharing his garden.' },
  { title: 'The Velveteen Rabbit', author: 'Margery Williams', category: 'Magic', summary: 'A toy rabbit becomes real through love.' },
  { title: 'Peter Pan', author: 'J.M. Barrie', category: 'Adventure', summary: 'Children fly to Neverland with a boy who never grows up.' },
  { title: 'Pinocchio', author: 'Carlo Collodi', category: 'Adventure', summary: 'A wooden puppet dreams of becoming a real boy.' },
  { title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', category: 'Adventure', summary: 'A girl and her dog are swept away to a magical land.' },
  { title: 'Alice in Wonderland', author: 'Lewis Carroll', category: 'Adventure', summary: 'A girl falls down a rabbit hole into a strange world.' },
  { title: 'The Secret Garden', author: 'Frances Hodgson Burnett', category: 'Nature', summary: 'A hidden garden transforms three children.' },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', category: 'Dreams', summary: 'A prince from a tiny planet teaches about love.' },
  { title: 'The Wind in the Willows', author: 'Kenneth Grahame', category: 'Animals', summary: 'River animals share adventures and friendship.' },
  { title: 'Charlotte\'s Web', author: 'E.B. White', category: 'Friendship', summary: 'A spider saves her pig friend through clever writing.' },
  { title: 'The Tale of Peter Rabbit', author: 'Beatrix Potter', category: 'Animals', summary: 'A mischievous rabbit ventures into a forbidden garden.' },
  { title: 'The Jungle Book', author: 'Rudyard Kipling', category: 'Animals', summary: 'A boy raised by wolves learns the laws of the jungle.' },
  { title: 'Aladdin and the Magic Lamp', author: 'Arabian Nights', category: 'Magic', summary: 'A street boy finds a lamp with a powerful genie.' },
  { title: 'Ali Baba and the Forty Thieves', author: 'Arabian Nights', category: 'Adventure', summary: 'A poor woodcutter discovers a thieves\' treasure cave.' },
  { title: 'Sinbad the Sailor', author: 'Arabian Nights', category: 'Adventure', summary: 'A sailor has seven incredible voyages.' },
  { title: 'The Magic Carpet', author: 'Arabian Nights', category: 'Magic', summary: 'A prince finds a carpet that can fly through the sky.' },
  { title: 'The Firebird', author: 'Russian Folklore', category: 'Magic', summary: 'A prince captures a magical glowing bird.' },
  { title: 'Vasilisa the Beautiful', author: 'Russian Folklore', category: 'Magic', summary: 'A brave girl faces the witch Baba Yaga.' },
  { title: 'The Snow Maiden', author: 'Russian Folklore', category: 'Magic', summary: 'A girl made of snow comes to life.' },
  { title: 'The Nutcracker', author: 'E.T.A. Hoffmann', category: 'Magic', summary: 'A girl\'s nutcracker comes alive on Christmas Eve.' },
  { title: 'The Sandman', author: 'Hans Christian Andersen', category: 'Dreams', summary: 'A magical man brings dreams to sleeping children.' },
  { title: 'The Magic Porridge Pot', author: 'Brothers Grimm', category: 'Magic', summary: 'A pot that cooks porridge by itself causes trouble.' },
  { title: 'The Three Billy Goats Gruff', author: 'Norwegian Folklore', category: 'Animals', summary: 'Three goats outsmart a hungry troll.' },
  { title: 'The Shoemaker\'s Dream', author: 'Traditional', category: 'Dreams', summary: 'A shoemaker dreams of finding treasure.' },
  { title: 'The Rainbow Fish', author: 'Marcus Pfister', category: 'Friendship', summary: 'A beautiful fish learns the joy of sharing.' },
  { title: 'The Giving Tree', author: 'Shel Silverstein', category: 'Friendship', summary: 'A tree gives everything to a boy she loves.' },
  { title: 'Stone Soup', author: 'European Folklore', category: 'Friendship', summary: 'Hungry travelers trick villagers into sharing.' },
  { title: 'The Little Engine That Could', author: 'Watty Piper', category: 'Adventure', summary: 'A small engine accomplishes a big task through determination.' },
  { title: 'The Owl and the Pussycat', author: 'Edward Lear', category: 'Animals', summary: 'An owl and a cat sail away to be married.' },
  { title: 'Where the Wild Things Are', author: 'Maurice Sendak', category: 'Adventure', summary: 'A boy sails to an island of wild creatures.' },
  { title: 'Goodnight Moon', author: 'Margaret Wise Brown', category: 'Dreams', summary: 'A bunny says goodnight to everything in the room.' },
  { title: 'The Snowy Day', author: 'Ezra Jack Keats', category: 'Nature', summary: 'A boy explores his neighborhood after a snowfall.' },
  { title: 'Corduroy', author: 'Don Freeman', category: 'Friendship', summary: 'A teddy bear searches for his missing button.' },
  { title: 'Curious George', author: 'H.A. Rey', category: 'Adventure', summary: 'A curious monkey gets into all sorts of trouble.' },
  { title: 'The Very Hungry Caterpillar', author: 'Eric Carle', category: 'Nature', summary: 'A caterpillar eats through food before becoming a butterfly.' },
  { title: 'Make Way for Ducklings', author: 'Robert McCloskey', category: 'Animals', summary: 'A duck family searches for the perfect home.' },
  { title: 'The Story of Ferdinand', author: 'Munro Leaf', category: 'Animals', summary: 'A bull who prefers smelling flowers to fighting.' },
  { title: 'Madeline', author: 'Ludwig Bemelmans', category: 'Adventure', summary: 'A brave girl in a Paris boarding school.' },
  { title: 'The Cat in the Hat', author: 'Dr. Seuss', category: 'Adventure', summary: 'A cat creates chaos on a rainy day.' },
  { title: 'Green Eggs and Ham', author: 'Dr. Seuss', category: 'Friendship', summary: 'Sam-I-Am tries to share his favorite food.' },
  { title: 'The Lorax', author: 'Dr. Seuss', category: 'Nature', summary: 'A creature speaks for the trees.' },
  { title: 'Horton Hears a Who', author: 'Dr. Seuss', category: 'Friendship', summary: 'An elephant protects tiny creatures no one else can hear.' },
  { title: 'The Magic School Bus', author: 'Joanna Cole', category: 'Adventure', summary: 'A class takes incredible field trips.' },
  { title: 'The Polar Express', author: 'Chris Van Allsburg', category: 'Magic', summary: 'A boy takes a magical train ride to the North Pole.' },
  { title: 'The Snowman', author: 'Raymond Briggs', category: 'Magic', summary: 'A boy\'s snowman comes to life for one magical night.' },
  { title: 'Sylvester and the Magic Pebble', author: 'William Steig', category: 'Magic', summary: 'A donkey makes a wish that goes wrong.' },
  { title: 'Strega Nona', author: 'Tomie dePaola', category: 'Magic', summary: 'A magical grandmother\'s pasta pot causes trouble.' },
  { title: 'The Paper Bag Princess', author: 'Robert Munsch', category: 'Princesses', summary: 'A princess rescues a prince from a dragon.' },
  { title: 'The True Story of the Three Little Pigs', author: 'Jon Scieszka', category: 'Animals', summary: 'The wolf tells his side of the famous story.' },
  { title: 'The Frog Princess', author: 'Russian Folklore', category: 'Princesses', summary: 'A prince must find his bride who is a frog.' },
  { title: 'The Glass Mountain', author: 'Polish Folklore', category: 'Adventure', summary: 'Knights try to climb an impossible mountain.' },
  { title: 'The Enchanted Forest', author: 'Traditional', category: 'Nature', summary: 'A child discovers a forest full of magic.' },
  { title: 'The Moonlit Garden', author: 'Traditional', category: 'Dreams', summary: 'A garden that only blooms under moonlight.' },
  { title: 'The Crystal Cave', author: 'Traditional', category: 'Adventure', summary: 'A explorer discovers a cave of wonders.' },
  { title: 'The Dragon\'s Pearl', author: 'Chinese Folklore', category: 'Magic', summary: 'A boy finds a magical pearl that brings good fortune.' },
];

export const fairyTales: FairyTale[] = [
  ...classicTales.map((tale, index) => ({
    id: `classic-${index + 1}`,
    title: tale.title!,
    author: tale.author!,
    category: categories[index % categories.length],
    duration: `${Math.floor(Math.random() * 10) + 5} min`,
    coverImage: storyImages[index % storyImages.length],
    summary: tale.summary!,
    content: tale.content!,
  })),
  ...additionalTales.map((tale, index) => ({
    id: `tale-${index + 11}`,
    title: tale.title!,
    author: tale.author!,
    category: tale.category || categories[index % categories.length],
    duration: `${Math.floor(Math.random() * 10) + 5} min`,
    coverImage: storyImages[(index + 3) % storyImages.length],
    summary: tale.summary!,
    content: generateStoryContent(tale.title!, `a ${tale.summary?.toLowerCase().replace(/\.$/, '') || 'magical character on an incredible journey'}`),
  })),
];

export const getCategories = (): string[] => categories;

export const getStoriesByCategory = (category: string): FairyTale[] => {
  if (category === 'All') return fairyTales;
  return fairyTales.filter(tale => tale.category === category);
};

export const getStoryById = (id: string): FairyTale | undefined => {
  return fairyTales.find(tale => tale.id === id);
};
