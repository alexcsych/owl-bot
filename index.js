require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
})

const TRIGGER_CHANNEL_ID = process.env.TRIGGER_CHANNEL_ID
const CATEGORY_ID = process.env.CATEGORY_ID

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channelId && newState.channelId === TRIGGER_CHANNEL_ID) {
    const guild = newState.guild
    const member = newState.member

    const tempChannel = await guild.channels.create({
      name: `Комната ${member.user.username}`,
      type: 2,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: member.id,
          allow: ['Connect', 'Speak', 'ViewChannel']
        },
        {
          id: guild.roles.everyone,
          deny: ['Connect']
        }
      ]
    })

    await member.voice.setChannel(tempChannel)

    const interval = setInterval(() => {
      if (tempChannel.members.size === 0) {
        tempChannel.delete().catch(() => {})
        clearInterval(interval)
      }
    }, 5000)
  }
})

client.login(process.env.DISCORD_TOKEN)
