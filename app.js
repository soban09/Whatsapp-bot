const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');

// client-three is beta multi devices one

const client = new Client({
    authStrategy: new LocalAuth({clientId: 'client-three'})
});
// const client = new Client();

var savedSession;

client.on('authenticated', (session) => {    
    savedSession = session;
});

// const client = new Client({
//     authStrategy: new LegacySessionAuth({
//         session: {} // saved session object
//     })
// });

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    client.getChats().then((chats)=>{
        const myGroup = chats.find(
            (chat) => chat.name === "Shresth"
        );
    })
});

client.on('message', async msg => {
	// var msg = message.body;
    var extractSpamCmd = msg.body.substring(0,4);
    var spamMsg = msg.body.substring(5,msg.length);


    if(msg.body === '!ping') {
		msg.reply('pong');
	}
    if(extractSpamCmd === 'spam'){
        for(var i=0; i<20; i++){
            client.sendMessage(msg.from, spamMsg);
        }
    }
    else if(msg.body === 'Hi'){
		msg.reply('Hi');
    }
    else if(msg.body === 'Hello'){
        msg.reply('Hello');
    }
    else if(msg.body === 'pls meme'){
        const meme = await axios("https://meme-api.herokuapp.com/gimme")
        .then(res=>res.data)

        client.sendMessage(msg.from, await MessageMedia.fromUrl(meme.url));
    }
    else if(msg.body === 'pls joke'){
        const joke = await axios("https://v2.jokeapi.dev/joke/Any")
        .then(res => res.data)

        const jokeMsg = await client.sendMessage(msg.from, joke.setup || joke.joke);
        if(joke.delivery) {
            setTimeout(function() {
                jokeMsg.reply(joke.delivery);
            }, 5000);
        }
    }
    else if(msg.body.search('good')!=-1 || msg.body.search('cool')!=-1){
        msg.reply('I know 😎');
    }
    else if(msg.body.search('fuck')!=-1 || msg.body.search('shit')!=-1){
        msg.reply('Fuck You, you piece of shit');
    }
    else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);

    } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newSubject = msg.body.slice(9);
            chat.setSubject(newSubject);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newDescription = msg.body.slice(6);
            chat.setDescription(newDescription);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!leave') {
        // Leave the group
        let chat = await msg.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!join ')) {
        const inviteCode = msg.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            msg.reply('Joined the group!');
        } catch (e) {
            msg.reply('That invite code seems to be invalid.');
        }
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.initialize();