require('dotenv').config()
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType
} = require('discord.js')

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
})

const TRIGGER_CHANNEL_ID = process.env.TRIGGER_CHANNEL_ID
const CATEGORY_ID = process.env.CATEGORY_ID

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channelId && newState.channelId === TRIGGER_CHANNEL_ID) {
    const guild = newState.guild
    const member = newState.member

    try {
      const tempChannel = await guild.channels.create({
        name: `Комната ${member.user.username}`,
        type: ChannelType.GuildVoice,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.Connect,
              PermissionsBitField.Flags.Speak,
              PermissionsBitField.Flags.ViewChannel
            ]
          }
        ]
      })

      await member.voice.setChannel(tempChannel)

      const interval = setInterval(() => {
        if (tempChannel.members.size === 0) {
          tempChannel.delete().catch(console.error)
          clearInterval(interval)
        }
      }, 5000)
    } catch (error) {
      console.error('Ошибка при создании канала:', error)
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
