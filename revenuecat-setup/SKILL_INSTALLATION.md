# RevenueCat Setup - Claude Code Skill Installation

## Installation as Claude Code Skill

### Option 1: Install from Directory

1. **Navigate to your Claude Code skills directory:**
   ```bash
   cd ~/.claude/skills
   # or wherever your Claude Code skills are stored
   ```

2. **Clone or copy this skill:**
   ```bash
   # If using git
   git clone <repository-url> revenuecat-setup

   # Or copy the directory
   cp -r /Users/carminemattiascarciello/Downloads/Projects/revenuecat-setup-cli revenuecat-setup
   ```

3. **Install dependencies and build:**
   ```bash
   cd revenuecat-setup
   npm install
   npm run build
   ```

4. **Verify installation:**
   The skill should now be available in Claude Code as `/revenuecatsetup`

### Option 2: Symlink Existing Installation

If you've already installed the CLI globally or want to use an existing installation:

```bash
cd ~/.claude/skills
ln -s /Users/carminemattiascarciello/Downloads/Projects/revenuecat-setup-cli revenuecat-setup
```

## Usage

Once installed, you can invoke the skill in Claude Code:

```
/revenuecatsetup
```

This will launch the interactive setup wizard.

## Skill Configuration

The skill is configured via the metadata in `SKILL.md`:

```json
{
  "name": "revenuecat-setup",
  "command": "revenuecatsetup",
  "description": "Automate complete RevenueCat project setup with apps, products, entitlements, and offerings configuration",
  "category": "development",
  "version": "1.0.0"
}
```

## Entry Point

The skill uses `skill-entry.js` as its entry point, which:
1. Verifies the compiled files exist
2. Executes the main CLI (`dist/index.js`)
3. Handles errors and exit codes

## Requirements

- Node.js >= 16.0.0
- npm or yarn
- RevenueCat account and API key

## Troubleshooting

### "Compiled files not found"
Run the build command:
```bash
npm run build
```

### Skill not appearing in Claude Code
1. Check that SKILL.md has the correct metadata JSON block
2. Verify the skill is in the correct directory
3. Restart Claude Code

### Permission errors
Make sure the entry point is executable:
```bash
chmod +x skill-entry.js
```

## Testing the Skill

Test the skill directly:
```bash
npm run skill
```

Or test the compiled version:
```bash
node skill-entry.js
```

## Updating the Skill

To update the skill:
```bash
cd ~/.claude/skills/revenuecat-setup
git pull  # if using git
npm install
npm run build
```

## Uninstalling

To remove the skill:
```bash
rm -rf ~/.claude/skills/revenuecat-setup
```

---

For more information, see:
- [SKILL.md](./SKILL.md) - Usage guide
- [README.md](./README.md) - Full documentation
- [PROJECT_HANDOFF.md](./PROJECT_HANDOFF.md) - Technical details
