/**
 * PPLGBot - Owner Command: TestPlayer
 * Menguji fungsi player (Hanya untuk owner)
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "testplayer",
  description: "Uji fungsi player musik",
  developerOnly: true,

  options: [
    {
      name: "action",
      description: "Aksi yang akan dilakukan",
      type: 3, // String
      required: true,
      choices: [
        { name: "Status", value: "status" },
        { name: "List Players", value: "list" },
        { name: "Destroy All", value: "destroy" },
        { name: "Info", value: "info" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const action = interaction.options.getString("action");

    // Check if user is owner
    const owners = client.config.owners || client.config.developers || [];
    if (!owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk menggunakan command ini.",
        ephemeral: true
      });
    }

    switch (action) {
      case "status":
        const players = client.riffy.players;
        const nodes = Array.from(client.riffy.nodes.values());
        
        const statusContainer = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 📊 Status Player")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Player Stats:**\n` +
              `• Total Players: ${players.size}\n` +
              `• Nodes Terhubung: ${nodes.filter(n => n.isConnected).length}\n` +
              `• Nodes Total: ${nodes.length}`
            )
          );

        await interaction.reply({
          components: [statusContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;

      case "list":
        const playerList = Array.from(client.riffy.players.entries());
        
        if (playerList.length === 0) {
          const noPlayers = new ContainerBuilder()
            .setAccentColor(0xf59e0b)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("### 📋 Tidak Ada Player")
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("Tidak ada player yang aktif.")
            );

          return interaction.reply({
            components: [noPlayers],
            flags: MessageFlags.IsComponentsV2
          });
        }

        const listText = playerList.map(([guildId, player]) => {
          return `• Guild: ${guildId}\n  Playing: ${player.playing}\n  Paused: ${player.paused}\n  Queue: ${player.queue.length}`;
        }).join("\n\n");

        const listContainer = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 📋 Daftar Player Aktif")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(listText)
          );

        await interaction.reply({
          components: [listContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;

      case "destroy":
        let destroyCount = 0;
        for (const [guildId, player] of client.riffy.players) {
          player.destroy();
          destroyCount++;
        }

        const destroyContainer = new ContainerBuilder()
          .setAccentColor(0x22c55e)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ✅ Player Dihancurkan")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${destroyCount} player telah dihancurkan.`
            )
          );

        await interaction.reply({
          components: [destroyContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;

      case "info":
        const nodeInfo = Array.from(client.riffy.nodes.values()).map(node => {
          const memUsed = node.stats?.memory?.used || 0;
          return `**Node: ${node.name}**\n` +
            `• Connected: ${node.isConnected}\n` +
            `• Players: ${node.stats?.players || 0}\n` +
            `• Playing: ${node.stats?.playingPlayers || 0}\n` +
            `• Memory: ${Math.round(memUsed / 1024 / 1024)}MB`;
        }).join("\n\n");

        const infoContainer = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 📡 Info Node")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(nodeInfo || "Tidak ada node.")
          );

        await interaction.reply({
          components: [infoContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;
    }
  }
};

/**
 * PPLGBot - Owner Command
 */

