const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs');
const { DB_PATH } = require('../const');
const fsPromise = fs.promises;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('del_t')
		.setDescription('Delete target from list')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('target name or id')
            .setRequired(true)),

	execute(/** @type{Discord.CommandInteraction}*/interaction) {
        console.log('in del_t');

        const userId = interaction.user.id;
		const targetId = interaction.options.get('target').value;

        // Delay the reply
        interaction.deferReply()
        // Read the db file
        .then(() => fsPromise.readFile(DB_PATH))
        // Parse it
        .then(JSON.parse)
        // If user object and target exists, delete it
        .then(obj => {

            // Check guild object first
            let guildObject = obj[interaction.guildId];

            if(guildObject !== undefined){
                if(guildObject[userId] !== undefined){
                    /** @type{Array<Discord.Snowflake>} */
                    const userTargets = guildObject[userId]["targets"];
                    const targetIndex = userTargets.indexOf(targetId);
    
                    // Delete the target if it is in the array
                    if(targetIndex !== -1){
                        userTargets.splice(targetIndex, 1);
                    }
                }
            }
            
            return obj;
        })
        // Stringify object
        .then(JSON.stringify)
        // Save it in db file
        .then(data => fsPromise.writeFile(DB_PATH, data))
        // Reply
        .then(() => interaction.editReply('User deleted from targets'))
        // Delete reply after 5sec
        .then(() => setTimeout(() => interaction.deleteReply(), 5000))
        .catch(console.error);
	}
};