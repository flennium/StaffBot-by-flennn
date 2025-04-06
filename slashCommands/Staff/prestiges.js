const { ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json");
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');



registerFont(path.join(__dirname, 'Minecraft.ttf'), { family: 'Minecraft' });

const backgrounds = [
  path.join(__dirname, 'bg_1.png'),
  path.join(__dirname, 'bg_2.png'),
  path.join(__dirname, 'bg_3.png'),
  path.join(__dirname, 'bg_4.png'),
];


module.exports = {
  name: 'prestiges',
  description: 'Display all prestige levels and their thresholds.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  run: async (client, interaction) => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

const rainbow = ctx.createLinearGradient(40, 368 - 20, 40, 368 + 20);
rainbow.addColorStop(0, 'red');
rainbow.addColorStop(0.2, 'orange');
rainbow.addColorStop(0.4, 'yellow');
rainbow.addColorStop(0.6, 'green');
rainbow.addColorStop(0.8, 'blue');
rainbow.addColorStop(1, 'pink');

const prestigeLevels = [
  { name: 'Coal', threshold: 0, color: '#808080' },
  { name: 'Iron', threshold: 50, color: '#CCCCCC' },
  { name: 'Gold', threshold: 100, color: '#FFAA00' },
  { name: 'Diamond', threshold: 180, color: '#55FFFF' },
  { name: 'Emerald', threshold: 220, color: '#00AA00' },
  { name: 'Netherite', threshold: 300, color: '#4C4C4C' },
  { name: 'Ancient Debris', threshold: 340, color: '#AA0000' },
  { name: 'Ender', threshold: 390, color: '#0000AA' },
  { name: 'Dragon', threshold: 450, color: rainbow },
  { name: 'Godly', threshold: 500, color: '#40FFFF' }
];
      
      
    const borderRadius = 50;
      
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(canvas.width - borderRadius, 0);
    ctx.arc(canvas.width - borderRadius, borderRadius, borderRadius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(canvas.width, canvas.height - borderRadius);
    ctx.arc(canvas.width - borderRadius, canvas.height - borderRadius, borderRadius, 0, 0.5 * Math.PI);
    ctx.lineTo(borderRadius, canvas.height);
    ctx.arc(borderRadius, canvas.height - borderRadius, borderRadius, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(0, borderRadius);
    ctx.arc(borderRadius, borderRadius, borderRadius, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.clip();

    const randomBgPath = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const background = await loadImage(randomBgPath);
    
    ctx.drawImage(background, 0, 0, 800, 600);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.font = '48px Minecraft';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 7;
    ctx.shadowOffsetY = 7;
      
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Prestige Levels', 20, 60);

    ctx.font = '24px Minecraft';
    prestigeLevels.forEach((level, index) => {
      const y = 120 + index * 45;
      ctx.fillStyle = level.color;
      ctx.fillText(`${level.name}: ${level.threshold} cases`, 40, y);
    });

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'prestige_levels.png' });

    return interaction.reply({
      files: [attachment],
      ephemeral: false,
    });
  },
};