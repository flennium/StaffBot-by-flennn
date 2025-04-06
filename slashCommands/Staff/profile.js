const { ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const CaseModel = require('../../models/CasesData');
const { excuserole, compenrole, staffrole, servername } = require("../../configs/serverinfo.json");
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

const prestigeLevels = [
  { name: 'Coal', threshold: 0, color: '#808080' },
  { name: 'Iron', threshold: 50, color: '#CCCCCC' },
  { name: 'Gold', threshold: 100, color: '#FFAA00' },
  { name: 'Diamond', threshold: 180, color: '#55FFFF' },
  { name: 'Emerald', threshold: 220, color: '#00AA00' },
  { name: 'Netherite', threshold: 300, color: '#4C4C4C' },
  { name: 'Ancient Debris', threshold: 340, color: '#AA0000' },
  { name: 'Ender', threshold: 390, color: '#0000AA' },
  { name: 'Dragon', threshold: 450, color: '#AAAAAA' },
  { name: 'Godly', threshold: 500, color: '#40FFFF' }
];

const Colors = {
  yellow: '#FFD700',
  blue: '#1E90FF',
};


registerFont(path.join(__dirname, 'Minecraft.ttf'), { family: 'Minecraft' });

const backgrounds = [
  path.join(__dirname, 'bg_1.png'),
  path.join(__dirname, 'bg_2.png'),
  path.join(__dirname, 'bg_3.png'),
  path.join(__dirname, 'bg_4.png'),
];

module.exports = {
  name: 'profile',
  description: 'Display the Staff user profile.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  options: [
    {
      name: 'user',
      description: 'Shows specific staff user profile.',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const userData = await CaseModel.findOne({ 'Staff.UserID': user.id });

    if (!userData || !userData.Staff) {
      return interaction.reply({
        content: `No data found for ${user.username}.`,
        ephemeral: true,
      });
    }

    const points = {
      discord: userData.Staff.Points[0]?.discord || 0,
      minecraft: userData.Staff.Points[0]?.minecraft || 0,
      compensation: userData.Staff.Points[0]?.compensation || 0,
      tickets: userData.Staff.Points[0]?.tickets || 0
    };

    const totalPoints = Object.values(points).reduce((sum, value) => sum + value, 0);
    const casesCount = userData.Staff.cases.length;

    let currentPrestige = prestigeLevels[0];
    let nextPrestige = prestigeLevels[1];

    for (let i = prestigeLevels.length - 1; i >= 0; i--) {
      if (casesCount >= prestigeLevels[i].threshold) {
        currentPrestige = prestigeLevels[i];
        nextPrestige = prestigeLevels[i + 1] || prestigeLevels[i];
        break;
      }
    }

    const casesUntilNextPrestige = nextPrestige.threshold - casesCount;

    const canvas = createCanvas(1400, 1050);
    const ctx = canvas.getContext('2d');

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
    
    ctx.drawImage(background, 0, 0, 1400, 1050);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 1400, 1050);

    ctx.font = '60px Minecraft';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 7;
    ctx.shadowOffsetY = 7;

    ctx.fillText(`${user.globalName}'s Staff Profile`, 40, 80);

    ctx.font = '48px Minecraft';
    ctx.fillStyle = Colors.yellow;
    ctx.fillText(`Total Points: ${totalPoints}`, 40, 160);

    ctx.fillStyle = Colors.yellow;
    ctx.fillText(`Cases Handled: ${casesCount}`, 40, 220);

    ctx.fillStyle = Colors.yellow;
    ctx.fillText('Prestige Level:', 40, 280);

    ctx.shadowOffsetX = 14;
    ctx.shadowOffsetY = 14;
    ctx.shadowBlur = 70;

    ctx.fillStyle = currentPrestige.color;
    ctx.fillText(currentPrestige.name, 400, 280);
    
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 7;
    ctx.shadowOffsetY = 7;

    ctx.fillStyle = Colors.yellow;
    ctx.fillText(`Cases until next prestige: ${casesUntilNextPrestige}`, 40, 340);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Point Breakdown:', 40, 420);

    ctx.fillStyle = Colors.blue;
    ctx.fillText(`Discord: ${points.discord}`, 80, 480);
    ctx.fillText(`Minecraft: ${points.minecraft}`, 80, 540);
    ctx.fillText(`Compensation: ${points.compensation}`, 80, 600);
    ctx.fillText(`Tickets: ${points.tickets}`, 80, 660);

    const barWidth = 1250;
    const barHeight = 60;
    const barX = 75;
    const barY = 740;
    const barBorderRadius = 30;

    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(barX + barBorderRadius, barY);
    ctx.lineTo(barX + barWidth - barBorderRadius, barY);
    ctx.arc(barX + barWidth - barBorderRadius, barY + barBorderRadius, barBorderRadius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(barX + barWidth, barY + barHeight - barBorderRadius);
    ctx.arc(barX + barWidth - barBorderRadius, barY + barHeight - barBorderRadius, barBorderRadius, 0, 0.5 * Math.PI);
    ctx.lineTo(barX + barBorderRadius, barY + barHeight);
    ctx.arc(barX + barBorderRadius, barY + barHeight - barBorderRadius, barBorderRadius, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(barX, barY + barBorderRadius);
    ctx.arc(barX + barBorderRadius, barY + barBorderRadius, barBorderRadius, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.fill();

    const progress = (casesCount - currentPrestige.threshold) / (nextPrestige.threshold - currentPrestige.threshold);
    ctx.fillStyle = currentPrestige.color;
    ctx.beginPath();
    ctx.moveTo(barX + barBorderRadius, barY);
    ctx.lineTo(barX + (barWidth * progress) - barBorderRadius, barY);
    ctx.arc(barX + (barWidth * progress) - barBorderRadius, barY + barBorderRadius, barBorderRadius, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(barX + (barWidth * progress), barY + barHeight - barBorderRadius);
    ctx.arc(barX + (barWidth * progress) - barBorderRadius, barY + barHeight - barBorderRadius, barBorderRadius, 0, 0.5 * Math.PI);
    ctx.lineTo(barX + barBorderRadius, barY + barHeight);
    ctx.arc(barX + barBorderRadius, barY + barHeight - barBorderRadius, barBorderRadius, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(barX, barY + barBorderRadius);
    ctx.arc(barX + barBorderRadius, barY + barBorderRadius, barBorderRadius, Math.PI, 1.5 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${currentPrestige.name} → ${nextPrestige.name}`, barX + 15, barY + 45);

    const avatarURL = interaction.user.avatarURL({ format: 'png', size: 256 });
    if (avatarURL) {
      try {
        const avatar = await loadImage(avatarURL);
        const avatarSize = 200; 
        const padding = 20;
        const x = canvas.width - avatarSize - padding; 
        const y = padding; 
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(avatar, x, y, avatarSize, avatarSize);
        
        ctx.restore();
      } catch (error) {
        console.error('Error loading avatar image:', error);
      }
    }
    
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `${user.id}_profile.png` });

    return interaction.reply({
      files: [attachment],
      ephemeral: false,
    });
  },
};
