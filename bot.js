const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const request = require('request');
const fs = require('fs');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');

const GOOGLE_API_KEY = 'AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8';
const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();
const PREFIX = '•';
client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => { 
console.log(`
------------------------------------------------------
> Logging in...
------------------------------------------------------
Logged in as ${client.user.tag}
Working on ${client.guilds.size} servers!
${client.channels.size} channels and ${client.users.size} users cached!
I am logged in and ready to roll!
LET'S GO!
------------------------------------------------------
-------------------------------------------------------
------------------------------------------------------
----------------------Bot's logs----------------------`);


});

client.on('ready', () => {});
console.log("Logged")
var download = function(uri, filename, callback) {
	request.head(uri, function(err, res, body) {
		console.log('content-type:', res.headers['content-type']);
		console.log('content-length:', res.headers['content-length']);

		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

client.on('message', function(message) {
	const member = message.member;
	const mess = message.content.toLowerCase();
	const args = message.content.split(' ').slice(1).join(' ');

	if (mess.startsWith(PREFIX + 'play')) {
		if (!message.member.voiceChannel) return message.reply('** انت لست في روم الاغاني **');
		// if user is not insert the URL or song title
		if (args.length == 0) {
			let play_info = new Discord.RichEmbed()
				.setAuthor(client.user.username, client.user.avatarURL)
				.setDescription('**هل يمكنك وضع اسم اغنيه او رابط اغنيه**')
			message.channel.sendEmbed(play_info)
			return;
		}
		if (queue.length > 0 || isPlaying) {
			getID(args, function(id) {
				add_to_queue(id);
				fetchVideoInfo(id, function(err, videoInfo) {
					if (err) throw new Error(err);
					let play_info = new Discord.RichEmbed()
						.setAuthor("تم وضعها في قائمه ", message.author.avatarURL)
						.setDescription(`**${videoInfo.title}**`)
						.setColor("RANDOM")
						.setFooter('تم تشغيل بواسطه:' + message.author.tag)
						.setImage(videoInfo.thumbnailUrl)
					//.setDescription('?')
					message.channel.sendEmbed(play_info);
					queueNames.push(videoInfo.title);
					// let now_playing = videoInfo.title;
					now_playing.push(videoInfo.title);

				});
			});
		}
		else {

			isPlaying = true;
			getID(args, function(id) {
				queue.push('placeholder');
				playMusic(id, message);
				fetchVideoInfo(id, function(err, videoInfo) {
					if (err) throw new Error(err);
					let play_info = new Discord.RichEmbed()
						.setAuthor(`تم تشغيل`, message.author.avatarURL)
						.setDescription(`**${videoInfo.title}**`)
						.setColor("RANDOM")
						.setFooter('تم تشغيل بواسطه: ' + message.author.tag)
						.setThumbnail(videoInfo.thumbnailUrl)
					//.setDescription('?')
					message.channel.sendEmbed(play_info);
				});
			});
		}
	}
	else if (mess.startsWith(PREFIX + 'skip')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		message.reply(':gear: **تم تخطي اغنيه**').then(() => {
			skip_song(message);
			var server = server = servers[message.guild.id];
			if (message.guild.voiceConnection) message.guild.voiceConnection.end();
		});
	}
	else if (message.content.startsWith(PREFIX + 'vol')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		// console.log(args)
		if (args > 10) return message.reply(':x: **10**');
		if (args < 1) return message.reply(":x: **1**");
		dispatcher.setVolume(1 * args / 10);
		message.channel.sendMessage(`**${dispatcher.volume*10}** :تم تحديث صوت الي  `);
	}
	else if (mess.startsWith(PREFIX + 'pause')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		message.reply(':gear: **تم توقيف بوت مؤقتا**').then(() => {
			dispatcher.pause();
		});
	}
	else if (mess.startsWith(PREFIX + 'unpause')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		message.reply(':gear: **تم اعاده تشغيل اغنيه**').then(() => {
			dispatcher.resume();
		});
	}
	else if (mess.startsWith(PREFIX + 'stop')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		message.reply(':name_badge: **تم توقيف اغنيه**');
		var server = server = servers[message.guild.id];
		if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
	}
	else if (mess.startsWith(PREFIX + 'join')) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		message.member.voiceChannel.join().then(message.react('✅'));
	}
	else if (mess.startsWith(PREFIX + 'play')) {
		getID(args, function(id) {
			add_to_queue(id);
			fetchVideoInfo(id, function(err, videoInfo) {
				if (err) throw new Error(err);
				if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
				if (isPlaying == false) return message.reply(':x:');
				let playing_now_info = new Discord.RichEmbed()
					.setAuthor(client.user.username, client.user.avatarURL)
					.setDescription(`**${videoInfo.title}**`)
					.setColor("RANDOM")
					.setFooter('Requested By:' + message.author.tag)
					.setImage(videoInfo.thumbnailUrl)
				message.channel.sendEmbed(playing_now_info);
				queueNames.push(videoInfo.title);
				// let now_playing = videoInfo.title;
				now_playing.push(videoInfo.title);

			});

		});
	}

	function skip_song(message) {
		if (!message.member.voiceChannel) return message.reply('**عذرا انت لست في روم الاغاني**');
		dispatcher.end();
	}

	function playMusic(id, message) {
		voiceChannel = message.member.voiceChannel;


		voiceChannel.join().then(function(connectoin) {
			let stream = ytdl('https://www.youtube.com/watch?v=' + id, {
				filter: 'audioonly'
			});
			skipReq = 0;
			skippers = [];

			dispatcher = connectoin.playStream(stream);
			dispatcher.on('end', function() {
				skipReq = 0;
				skippers = [];
				queue.shift();
				queueNames.shift();
				if (queue.length === 0) {
					queue = [];
					queueNames = [];
					isPlaying = false;
				}
				else {
					setTimeout(function() {
						playMusic(queue[0], message);
					}, 500);
				}
			});
		});
	}

	function getID(str, cb) {
		if (isYoutube(str)) {
			cb(getYoutubeID(str));
		}
		else {
			search_video(str, function(id) {
				cb(id);
			});
		}
	}

	function add_to_queue(strID) {
		if (isYoutube(strID)) {
			queue.push(getYoutubeID(strID));
		}
		else {
			queue.push(strID);
		}
	}

	function search_video(query, cb) {
		request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
			var json = JSON.parse(body);
			cb(json.items[0].id.videoId);
		});
	}


	function isYoutube(str) {
		return str.toLowerCase().indexOf('youtube.com') > -1;
	}
});


client.on("message", (message) => {
            if (message.channel.type === "dm") {
        if (message.author.id === client.user.id) return;
        let yumz = new Discord.RichEmbed()
                    .setTimestamp()
                    .setTitle("Direct Message To The Bot")
                    .addField(`Sent By:`, `<@${message.author.id}>`)
                    .setColor("RANDOM")
                    .setThumbnail(message.author.displayAvatarURL)
                    .addField(`Message: `, `\n\n\`\`\`${message.content}\`\`\``)
                    .setFooter(`DM Bot Messages | DM Logs`)
                client.users.get("520645771293491201").send(yumz)
            }
});

client.on('message', message => {
    if (message.content.startsWith("•help")) {
let embed = new Discord.RichEmbed()
.setThumbnail(message.author.avatarURL)
.addField('     **$play** ' ,' ** if you want start your music do $play <link music or name >** ')
.addField('     **$stop**  ' ,' ** if you want stop music do $stop ** ')
.addField('     **$skip** ' , '** if you want skip music do $skip**') 
.addField('     **$vol** ' , '** to edit volume bot do $vol**') 
.addField('     **$pause** ' , '** to pause music do $pause **') 
.addField('     **$unpause** ' , '** if you unpause music do $unpause**') 




.setColor('#24efbd')
message.channel.sendEmbed(embed);
}
});


client.on('message', message => {
  if (!message.content.startsWith(PREFIX)) return;
  var args = message.content.split(' ').slice(1);
  var argresult = args.join(' ');
  if (message.author.id !== "475070652727033858") return;

if (message.content.startsWith(PREFIX + 'st')) {
  client.user.setGame(argresult, "https://www.twitch.tv/0T#6004");
	 console.log('test' + argresult);
    message.channel.sendMessage(`Streaming: **${argresult}`)
}

if (message.content.startsWith(PREFIX + 'un')) {
  client.user.setUsername(argresult).then
	  message.channel.sendMessage(`Username Changed To **${argresult}**`)
  return message.reply("تستطيع تغيير الاسم مرتين فقط في اليوم");
}
if (message.content.startsWith(PREFIX + 'av')) {
  client.user.setAvatar(argresult);
   message.channel.sendMessage(`Avatar Changed Successfully To **${argresult}**`);
}
});
client.login(process.env.BOT_TOKEN);
