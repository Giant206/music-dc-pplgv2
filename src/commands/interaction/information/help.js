/**
 * PPLGBot - Command: Help
 * Menampilkan semua command yang tersedia dengan tema dark mode
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  description: "Menampilkan semua command yang tersedia",

  run: async (client, interaction) => {
    // Get all commands
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith(".js"));

    const commands = commandFiles.map(file => {
      const cmd = require(path.join(commandsPath, file));
      return {
        name: cmd.name,
        description: cmd.description || "Tidak ada deskripsi"
      };
    });

    // Create select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_select")
      .setPlaceholder("Pilih command untuk melihat detail")
      .addOptions(
        commands.map(cmd => ({
          label: cmd.name,
          description: cmd.description.slice(0, 90),
          value: cmd.name
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Create help container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 📖 Menu Help PPLGBot")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Total Command: ${commands.length}**\n\n` +
          `PPLGBot adalah bot musik Discord premium dengan fitur lengkap.\n\n` +
          `**Kategori Command:**\n` +
          `• 🎵 Music - Command untuk memutar musik\n` +
          `• ℹ️ Information - Command informasi bot\n\n` +
          `Pilih command di bawah untuk melihat detail.`
        )
      );

    // Create buttons
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("help_music")
          .setLabel("Music")
          .setEmoji("🎵")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("help_info")
          .setLabel("Info")
          .setEmoji("ℹ️")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setURL("https://discord.gg/")
          .setLabel("Support")
          .setEmoji("💬")
          .setStyle(ButtonStyle.Link)
      );

    const response = await interaction.reply({
      components: [container, row, buttons],
      flags: MessageFlags.IsComponentsV2,
      withResponse: true
    });

    // Get the message from response
    const message = response.resource?.message;

    // Create collector
    const collector = message.createMessageComponentCollector({
      time: 300000
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: "Ini bukan untukmu.", ephemeral: true });

      // Handle select menu
      if (i.isStringSelectMenu()) {
        const selected = commands.find(c => c.name === i.values[0]);

        const updatedContainer = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### 🔍 Command: /${selected.name}`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Deskripsi:** ${selected.description}\n\n` +
              `Gunakan \`/${selected.name}\` untuk menggunakan command ini.`
            )
          );

        await i.update({
          components: [updatedContainer, row, buttons]
        });
      }
      
      // Handle button clicks
      if (i.isButton()) {
        let category = "";
        let categoryCommands = [];
        
        switch (i.customId) {
          case "help_music":
            category = "Music";
            categoryCommands = commands.filter(c => 
              ["play", "pause", "resume", "stop", "skip", "queue", "nowplaying", "volume", "autoplay", "join", "leave", "loop", "shuffle", "filter"].includes(c.name)
            );
            break;
          case "help_info":
            category = "Information";
            categoryCommands = commands.filter(c => 
              ["ping", "about", "help", "node"].includes(c.name)
            );
            break;
        }
        
        if (categoryCommands.length > 0) {
          const categoryContainer = new ContainerBuilder()
            .setAccentColor(0x38bdf8)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`### 🎯 ${category} Commands`)
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                categoryCommands.map(c => `• \`/${c.name}\` - ${c.description}`).join("\n")
              )
            );
          
          await i.update({
            components: [categoryContainer, row, buttons]
          });
        } else {
          await i.update({
            components: [container, row, buttons]
          });
        }
      }
    });
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */
