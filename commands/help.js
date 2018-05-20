const Discord = require("discord.js");

module.exports.run = async(bot, message, args) => {
    var embedTxt = "";
    const txtTable = {
        help: "Displays this help menu.",
        play: "Plays a youtube video's audio in a Voice Channel.",
        skip: "Skips a video in the queue.",
        stop: "Disconnects the bot from the Voice Channel.",
        kick: "Kicks a user by @mentioning.",
        ban: "Bans a user by @mentioning.",
        mute: "Mutes a user by @mentioning and specifying an amount of time."
    }
    for (var key in txtTable) {
        embedTxt = embedTxt + `\n**${key}** - ` + txtTable[key];
    }
    var embed = new Discord.RichEmbed()
        .setTitle("Brody Bot Help")
        .setDescription(embedTxt)
        .setColor("6835bf")
    message.author.send(embed);
}

module.exports.help = {
	name: "help"
}