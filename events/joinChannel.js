const { VoiceState } = require("discord.js");
const fs = require('fs');
const fsPromises = fs.promises;
const Discord = require('discord.js');
const { DB_PATH } = require("../const");

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(/** @type{VoiceState}*/oldState, /** @type{VoiceState}*/newState) {
        console.log('user joined a channel');
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        // If no old channel and new channel, user joined a channel
		if( 
            (oldChannel === undefined && newChannel !== undefined) ||
            (oldChannel !== undefined && newChannel !== undefined && oldChannel !== newChannel)
        ) {

            fsPromises.readFile(DB_PATH)
            .then(JSON.parse)
            .then( (/** @type{Array<Object>} */obj) => {

                // Check guild object first
                let guildObject = obj[newChannel.guildId];
                if(guildObject === undefined){
                    obj[newChannel.guildId] = {};
                    guildObject = obj[newChannel.guildId];
                }

                // For every member in the voice channel
                for(const currentUser of newChannel.members.values()){
                    const currentUserId = currentUser.id;

                    let currentUserTargets = [];
                    // Get the user targets from the file
                    /** @type{Array<Discord.Snowflake>} */
                    if(guildObject[currentUserId] !== undefined){
                        currentUserTargets = guildObject[currentUserId]["targets"];
                    }

                    // For every target
                    for(let i=0; i<currentUserTargets.length; i++){
                        const targetId = currentUserTargets[i];

                        // console.log('memeber : ', newState.member);
                        // if the user that joined is the target
                        if(targetId === newState.member.id){
                            console.log('should mp');
                            
                            currentUser.send(newState.member.user.username+' a rejoint le salon vocal '+ newChannel.name);
                        }
                    }
                }
            })
            .catch(console.error)
            // User Joins a voice channel
            
         }
	},
};