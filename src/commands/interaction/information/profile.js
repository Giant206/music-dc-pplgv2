/**
 * PPLGBot - Command: Profile
 * Menampilkan dan mengelola profile pengguna
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const db = require("../../../database/profile");

function formatTime(seconds) {
  if (!seconds) return "0 menit";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
}

module.exports = {
  name: "profile",
  description: "Tampilkan profile pengguna PPLGBot",

  options: [
    {
      name: "user",
      description: "Pengguna yang ingin dilihat (opsional)",
      type: 6, // User
      required: false
    }
  ],

  run: async (client, interaction) => {
    const targetUser = interaction.options?.getUser("user") || interaction.user;
    const profile = db.getProfile(targetUser.id);
    
    // Update username
    if (profile.username !== targetUser.username) {
      db.saveProfile(targetUser.id, { username: targetUser.username });
    }

    // Calculate level
    const commands = profile.totalCommands || 0;
    let level = 1;
    let expNeeded = 100;
    let exp = commands;
    
    while (exp >= expNeeded) {
      exp -= expNeeded;
      level++;
      expNeeded = level * 100;
    }
    
    const progress = Math.round((exp / expNeeded) * 10);
    const progressBar = "▓".repeat(progress) + "░".repeat(10 - progress);

    // Create profile container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### 👤 Profile: ${targetUser.username}`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(targetUser.displayAvatarURL({ size: 256 }))
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**📊 Level:** ${level}\n` +
              `**📈 XP:** ${exp}/${expNeeded}\n` +
              `${progressBar}\n\n` +
              `**🎵 Total Commands:** ${commands}\n` +
              `**⏰ Total Mendengarkan:** ${formatTime(profile.totalListening || 0)}\n\n` +
              `**📝 Bio:** ${profile.bio || "Belum ada bio"}\n` +
              `**🎶 Genre Favorit:** ${profile.favoriteGenre || "Belum diatur"}`
            )
          )
      );

    // Create buttons for own profile
    let buttons;
    if (targetUser.id === interaction.user.id) {
      buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("profile_edit_bio")
            .setLabel("Edit Bio")
            .setEmoji("📝")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("profile_edit_genre")
            .setLabel("Edit Genre")
            .setEmoji("🎵")
            .setStyle(ButtonStyle.Primary)
        );
    }

    return interaction.reply({
      components: buttons ? [container, buttons] : [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

/**
 * PPLGBot - Profile Command
 * View and manage user profiles
 */

