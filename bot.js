const Discord = require('discord.js');

const Util = require('discord.js');
    client = new Discord.Client({sisableEveryone: true})
 const devs = ['392414705873977346','475070652727033858'];
const adminprefix = "K";
client.on('message', message => {
    var argresult = message.content.split(` `).slice(1).join(' ');
      if (!devs.includes(message.author.id)) return;
      
  if (message.content.startsWith(adminprefix + 'ply')) {
    client.user.setGame(argresult);
      message.channel.sendMessage(`**  ${argresult} تم تغيير الحاله الي :white_check_mark:**`)
  } else 
  if (message.content.startsWith(adminprefix + 'wt')) {
  client.user.setActivity(argresult, {type:'WATCHING'});
      message.channel.sendMessage(`**  ${argresult} تم تغيير الحاله الي :white_check_mark:**`)
  } else 
  if (message.content.startsWith(adminprefix + 'ls')) {
  client.user.setActivity(argresult , {type:'LISTENING'});
      message.channel.sendMessage(`**  ${argresult} تم تغيير الحاله الي :white_check_mark:**`)
  } else 
  if (message.content.startsWith(adminprefix + 'st')) {
    client.user.setGame(argresult, "https://www.twitch.tv/Taaino");
      message.channel.sendMessage(`**  ${argresult} تم تغيير الحاله الي :white_check_mark:**`)
  }
  });

client.on('ready', () => {

console.log('taino');

});


client.login(process.env.BOT_TOKEN);
