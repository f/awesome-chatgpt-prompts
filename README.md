## ⚠️ Where are all the prompts gone?

> **No worries They are still here.** But it become impossible to maintain a monster README file. So now it has its own system. Still free, still open-sourced.
>
> 🌐 **[View All Prompts on prompts.chat](https://prompts.chat/prompts)**
> 
> 🔍 **[View All Prompts synced on GitHub (prompts.csv)](https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv)**
> 
> 📊 **[View All Prompts synced on Data Studio on HF (prompts.csv)](https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/viewer?views%5B%5D=train)**
> 

<p align="center">
  <img width="558" height="148" alt="Screenshot 2025-12-12 at 02 40 52" src="https://github.com/user-attachments/assets/8de2ba4c-5e89-4aae-aecb-32b188fb1bfb" />
  <br>
  <small>a.k.a. Awesome ChatGPT Prompts</small>
</p>

<h2 align="center">Sponsors</h3>

<div align="center">
  <a href="https://clemta.com/?utm_source=prompts.chat" align="center">
    <img align="center" height="50" alt="Clemta logo" src="https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/public/sponsors/clemta.webp">
  </a><br><br>
  <a href="https://windsurf.com/?utm_source=prompts.chat" align="center">
    <img align="center" height="40" alt="Cognition logo" src="https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/public/sponsors/cognition.svg">
  </a><br><br>
  <a href="https://warp.dev/?utm_source=prompts.chat" align="center">
    <img align="center" height="30" alt="Warp logo" src="https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/public/sponsors/warp.svg">
  </a><br><br>
  <sub>prompts.chat is vibecoded via Cognition products: Windsurf and Devin</sub>
<hr>
  <sub><a href="https://github.com/sponsors/f/sponsorships?sponsor=f&amp;tier_id=529895">Be my sponsor and your logo will be here!</a></sub>
</div>

---
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/f/awesome-chatgpt-prompts)

Welcome to the "Awesome ChatGPT Prompts" repository! While this collection was originally created for [ChatGPT](https://chat.openai.com/chat), these prompts work great with other AI models like [Claude](https://claude.ai/new), [Gemini](https://gemini.google.com), [Hugging Face Chat](https://hf.co/chat), [Llama](https://meta.ai), [Mistral](https://chat.mistral.ai), and more.

In this repository, you will find a variety of [prompts](prompts.csv) that can be used with ChatGPT and other AI chat models. We encourage you to [add your own prompts](https://prompts.chat) to the list, and to use AI to help generate new prompts as well. Your contributions to [prompts.chat](https://prompts.chat) will be contributions to this repository automatically.

## Want to deploy your own private prompt library for your team?

Check out our [Self-Hosting Guide](SELF-HOSTING.md) for instructions on setting up your own instance with **customizable branding, themes, and authentication**.

### Quickstart

```bash
git clone https://github.com/f/awesome-chatgpt-prompts.git
cd awesome-chatgpt-prompts
npm install
npm run db:push
npm run dev
```

### Quickstart: Running with Docker

**Requirements**
- Docker & Docker Compose
- [Just command runner](https://github.com/casey/just)

```bash
just build
just up
# wait until all containers are running
just db-seed
```
**.env Variables**

```env
COMPOSE_PROJECT_NAME="prompts.chat"

# App
APP_PORT=23000

# Database
DB_PORT=23010

# Database credentials (already used elsewhere)
# Add connection_limit and pool_timeout for serverless/production environments:
# Example: ?schema=public&connection_limit=5&pool_timeout=10
#
# Use for local postgres:
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prompts_chat?schema=public"
# Use for postgres in docker container:
DATABASE_URL="postgresql://prompts:prompts@db:5432/prompts?schema=public"

POSTGRES_USER=prompts
POSTGRES_PASSWORD=prompts
POSTGRES_DB=prompts

# pgAdmin
PGADMIN_PORT=23050
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD="your-super-secret-key-change-in-production"
```

**Access the services**

- Application: http://localhost:23000/

- pgAdmin (PostgreSQL Web UI): http://localhost:23050/


**Configure pgAdmin (PostgreSQL)**

Open pgAdmin in your browser.

- Log in using the credentials defined in .env.

- In the left sidebar, right-click Servers → Register → Server…

- Use the following settings.


**General tab**

| Field | Value   |
| ----- | ------- |
| Name  | prompts |

**Connection tab**

| Field               | Value   |
| ------------------- | ------- |
| Host name / Address | db      |
| Port                | 5432    |
| Username            | prompts |
| Password            | prompts |
| Save password       | enabled |

The database will now appear under Servers and its tables can be viewed via `Schemas → public → Tables`.

| Configuration               | Value     |
| --------------------------- | --------- |
| General:name                | `prompts` |
| Connection:Hostname/Address | `db`      |
| Connection:Username         | `prompts` |
| Connection:Password         | `prompts` |


### Private Clone Setup (Recommended for Teams)

For private deployments, use our **interactive setup wizard** to configure your instance with custom branding, disable sponsorship sections, and set up authentication:

```bash
git clone https://github.com/f/awesome-chatgpt-prompts.git
cd awesome-chatgpt-prompts
npm install
npm run setup
```

The setup wizard will guide you through:
- **Branding** — Set your organization name, logo, and description
- **Theme** — Choose colors, border radius, and UI style
- **Authentication** — Configure GitHub, Google, Azure AD, or email/password login
- **Features** — Enable/disable private prompts, categories, tags, AI search
- **Languages** — Select supported locales
- **Sponsors** — Optionally add your own sponsor logos (prompts.chat sponsors are disabled)

After setup, complete the configuration:

```bash
# Edit .env with your database and OAuth credentials
nano .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

> 💡 **Tip:** The setup script automatically enables "clone branding mode" which hides prompts.chat branding, achievements, and sponsors from the homepage.

We hope you find these prompts useful and have fun exploring AI chat models!

**[View on prompts.chat](https://prompts.chat)**

**[View Hugging Face Dataset](https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/)**
---

> ℹ️ **NOTE:** Sometimes, some of the prompts may not be working as you expected
> or may be rejected by the AI. Please try again, start a new thread, or log out
> and log back in. If these solutions do not work, please try rewriting the
> prompt using your own sentences while keeping the instructions same.

### Want to Write Effective Prompts?

I've authored an e-book called **"The Art of ChatGPT Prompting: A Guide to
Crafting Clear and Effective Prompts"**.

📖 **[Read the e-book](https://fka.gumroad.com/l/art-of-chatgpt-prompting)**

### Want to Learn How to Make Money using ChatGPT Prompts?

I've authored an e-book called **"How to Make Money with ChatGPT: Strategies,
Tips, and Tactics"**.

📖
**[Buy the e-book](https://fka.gumroad.com/l/how-to-make-money-with-chatgpt)**

### Want to Learn How to write image prompts for Midjourney AI?

I've authored an e-book called **"The Art of Midjourney AI: A Guide to Creating
Images from Text"**.

📖
**[Read the e-book](https://fka.gumroad.com/l/the-art-of-midjourney-ai-guide-to-creating-images-from-text)**

---

# Prompts

🔍 **[View All Prompts on GitHub (prompts.csv)](https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv)**

📊 **[View All Prompts as Data Studio on HF (prompts.csv)](https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/viewer?views%5B%5D=train)**

🌐 **[View All Prompts on prompts.chat](https://prompts.chat/prompts)**

---

## Contributors 😍

Many thanks to these AI whisperers:

<a href="https://github.com/f/awesome-chatgpt-prompts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=f/awesome-chatgpt-prompts" />
</a>

# License

This work is licensed under [CC0 1.0 Universal (Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/).

You can copy, modify, distribute, and use the prompts freely — even for commercial purposes — without asking permission or giving attribution. All prompts contributed to this repository are released into the public domain.
