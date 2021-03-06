const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ms = require("ms");
const bot = new Discord.Client();
const fs = require("fs");

bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);

    let jsFile = files.filter(f => f.split(".").pop() === "js")

    if (jsFile.length <= 0 ) {
        console.log("Couldn't find commands.");
        return;
    }

    jsFile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} Loaded.`);

        bot.commands.set(props.help.name, props);
    });
})

const token = process.env.BOT_TOKEN; // Token for bot.

var prefix = "?";

var queue = [];

bot.login(token);

function play(connection, message) {
    var server = message.guild.id;
    server.dispatcher = connection.playStream(ytdl(queue[0], {filter: "audioonly"}));
    queue.shift();
    server.dispatcher.on("end", function() {
        if (queue[0]) play(connection, message);
        else connection.disconnect();
    });
};

bot.on("ready", function() {
    bot.user.setActivity("Use ?help for help.");
});

bot.on("message", (message) => {
    if (message.content.startsWith(prefix)) {

        var args = message.content.substring(prefix.length).split(" ");

        if (message.author.id !== "251438677283176448") {
            return;
        }

        let commandfile = bot.commands.get(message.content.slice(prefix.length));
        if (commandfile) commandfile.run(bot, message, args);

        switch (args[0].toLowerCase()) {
            case "help":
                break;
            case "play":
                if (!args[1]) {
                    message.reply("Please provide a link, no link , NO MUSIC.");
                    return;
                }
                if (!message.member.voiceChannel) {
                    message.reply("Get into a voice channel, or else no music for you!");
                    return;
                }
                queue.push(args[1]);
                if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                    play(connection, message);
                });
                break;
            case "skip":
                var server = message.guild.id;
                if (server.dispatcher) server.dispatcher.end();
                break
            case "stop":
                var server = message.guild.id;
                if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
                break;
            case "kick":
                if(message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to kick.").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention ONE USER. COME ON, STOP TESTING ME!")
                }
                let kickMember = message.guild.member(message.mentions.users.first());
                if(!kickMember) {
                    return message.reply("I don't see that user. I'm not blind, trust me.");
                }
                if(!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
                    return message.reply("I don't have permissions to execute the command.").catch(console.error);
                }
                kickMember.kick().then(function(member) {
                    message.reply(`${member.user.username} was succesfully kicked. They can still come back for revenge...`).catch(console.error);
                }).catch(console.error)
                break;
            case "ban":
                if(message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to ban. NO MENTION, NO BAN!").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention ONE USER. COME ON, STOP TESTING ME!")
                }
                let banMember = message.guild.member(message.mentions.users.first());
                if(!banMember) {
                    return message.reply("I don't see that user. I'm not blind, trust me.");
                }
                if(!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) {
                    return message.reply("I don't have permissions to execute the command.").catch(console.error);
                }
                banMember.ban().then(function(member) {
                    message.reply(`${member.user.username} was succesfully banned. MUAHAHAHA!`).catch(console.error);
                }).catch(console.error)
                break;
            case "mute":
                if (message.mentions.users.size === 0) {
                    return message.reply("Please @mention a user to mute. NO MENTION, NO MUTE!").catch(console.error);
                }
                if (message.mentions.users.size > 1) {
                    return message.reply("Please only @mention ONE USER. COME ON, STOP TESTING ME!")
                }
                if (!args[2]) {
                    return message.reply("Please specify a time in seconds for how long you want the user to be muted.");
                }
                var muteMember = message.guild.member(message.mentions.users.first());
                const muteRole = message.guild.roles.find("name", "Muted");
                muteMember.addRole(muteRole.id);
                message.reply(`HAHAHAH! ${muteMember.displayName} has been muted for ${ms(args[2])} seconds!`);
                setTimeout(function() {
                    muteMember.removeRole(muteRole.id);
                    message.channel.send(`@${muteMember.user.tag} has been unmuted! Now be a good boy, OR ELSE!`);
                }, ms(args[2] + "s"));
                break;
            default:
                message.channel.send("That's not a command. Go commit die.");
                break;
        }
    }
});
