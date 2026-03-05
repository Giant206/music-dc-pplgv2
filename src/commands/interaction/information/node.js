/**
 * PPLGBot - Command: Node
 * Menampilkan statistik node Lavalink
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "node",
  description: "Statistik node Lavalink",

  run: async (client, interaction) => {
    const ms = (await import("pretty-ms")).default;

    try {
      let nodes = [];

      if (client.riffy) {
        nodes = Array.from(client.riffy.nodes.values());
      }

      // ============================================
      // ❌ NO NODES
      // ============================================
      if (!nodes.length) {
        const noNodes = new ContainerBuilder()
          .setAccentColor(0xef4444)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ❌ Tidak Ada Node")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Tidak ada node Lavalink yang terhubung saat ini."
            )
          );

        return interaction.reply({
          components: [noNodes],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // Format memory in MB
      const formatMB = (bytes) =>
        ((bytes ?? 0) / 1024 / 1024).toFixed(2);

      // Format percentage
      const formatPercent = (value) =>
        ((value ?? 0) * 100).toFixed(2);

      // Generate node container
      const generateContainer = (node, index) => {
        const identifier =
          node.name ||
          node.info?.identifier ||
          `Node ${index + 1}`;

        const online = node.isConnected
          ? "🟢 Online"
          : "🔴 Offline";

        const ping = node.ping
          ? `${node.ping}ms`
          : "N/A";

        const stats = node.stats || {};

        const players = stats.players ?? 0;
        const playing = stats.playingPlayers ?? 0;
        const uptime = stats.uptime
          ? ms(stats.uptime, { verbose: true })
          : "Tidak diketahui";

        const memory = stats.memory || {};
        const cpu = stats.cpu || {};

        return new ContainerBuilder()
          .setAccentColor(node.isConnected ? 0x22c55e : 0xef4444)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### 🖥️ ${identifier}`)
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Status:** ${online}\n` +
              `**Ping:** \`${ping}\`\n\n` +
              `### 📊 Statistik Player\n` +
              `Player: ${players}\n` +
              `Sedang Diputar: ${playing}\n` +
              `Uptime: ${uptime}\n\n` +
              `### 💻 Informasi CPU\n` +
              `Core: ${cpu.cores ?? "N/A"}\n` +
              `Beban Sistem: ${formatPercent(cpu.systemLoad)}%\n` +
              `Beban Lavalink: ${formatPercent(cpu.lavalinkLoad)}%\n\n` +
              `### 💾 Penggunaan Memori\n` +
              `Terpakai: ${formatMB(memory.used)} MB\n` +
              `Tersedia: ${formatMB(memory.free)} MB\n` +
              `Dialokasikan: ${formatMB(memory.allocated)} MB`
            )
          );
      };

      let currentPage = 0;
      const maxPages = nodes.length;

      // Create pagination buttons
      const getButtons = (page) =>
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("◀️ Sebelum")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("Sesudah ▶️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === maxPages - 1),
            new ButtonBuilder()
              .setCustomId("refresh")
              .setLabel("🔄 Segar")
              .setStyle(ButtonStyle.Secondary)
          );

      // Send initial response
      const response = await interaction.reply({
        components: [
          generateContainer(nodes[currentPage], currentPage),
          getButtons(currentPage)
        ],
        flags: MessageFlags.IsComponentsV2,
        withResponse: true
      });

      // Get the message from response
      const message = response.resource?.message;

      // Create collector for button interactions
      const collector = message.createMessageComponentCollector({
        time: 300000
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          return buttonInteraction.reply({
            content: "Anda tidak dapat menggunakan tombol ini.",
            flags: 64
          });
        }

        if (buttonInteraction.customId === "prev") {
          currentPage = Math.max(0, currentPage - 1);
        } else if (buttonInteraction.customId === "next") {
          currentPage = Math.min(maxPages - 1, currentPage + 1);
        } else if (buttonInteraction.customId === "refresh") {
          nodes = Array.from(client.riffy.nodes.values());
        }

        await buttonInteraction.update({
          components: [
            generateContainer(nodes[currentPage], currentPage),
            getButtons(currentPage)
          ]
        });
      });

      collector.on("end", () => {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("◀️ Sebelum")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("Sesudah ▶️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("refresh")
              .setLabel("🔄 Segar")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );

        message.edit({
          components: [
            generateContainer(nodes[currentPage], currentPage),
            disabledRow
          ]
        }).catch(() => {});
      });

    } catch (error) {
      console.error("Error dalam command node:", error);

      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Terjadi Kesalahan")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Terjadi kesalahan saat mengambil statistik node.\n\n\`\`\`js\n${error.message}\n\`\`\``
          )
        );

      return interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }
  }
};

/**
 * PPLGBot - Sistem Musik Modern
 */
