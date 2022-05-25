const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs');
const { DB_PATH } = require('../const');
const fsPromise = fs.promises;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_t')
		.setDescription('Add target to list')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('target name or id')
            .setRequired(true)),

	execute(/** @type{Discord.CommandInteraction}*/interaction) {
        console.log('in add_t');

        const userId = interaction.user.id;
		const targetId = interaction.options.get('target').value;

        if(userId === targetId){
            interaction.reply('Can\'t add yourself to the target list')
            .then(() => setTimeout(() => interaction.deleteReply(), 5000))
            .catch(console.error);

            return;
        }

        // Delay the reply
        interaction.deferReply()
        // Read the db file
        .then(() => fsPromise.readFile(DB_PATH))
        // Parse it
        .then(JSON.parse)
        // If user object exists, add target to existing targets
        // Otherwise create the object with the target
        .then(obj => {
            // Check guild object first
            let guildObject = obj[interaction.guildId];
            if(guildObject === undefined){
                obj[interaction.guildId] = {};
                guildObject = obj[interaction.guildId];
            }

            // Then check user
            if(guildObject[userId] === undefined){
                guildObject[userId] = { "targets": [targetId] };
            }else{
                /** @type{Array<Discord.Snowflake>} */
                const userTargets = guildObject[userId]["targets"];

                // Add the target if it is not in the array yet
                if(!userTargets.includes(targetId)){
                    userTargets.push(targetId);
                }
            }

            // console.log(`object after : `,obj);

            return obj;
        })
        // Stringify object
        .then(JSON.stringify)
        // Save it in db file
        .then(data => fsPromise.writeFile(DB_PATH, data))
        // Reply
        .then(() => interaction.editReply('User added to targets'))
        // Delete reply after 5sec
        .then(() => setTimeout(() => interaction.deleteReply(), 5000))
        .catch(console.error);
	}
};