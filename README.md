<div align="center">
  <img src="https://raw.githubusercontent.com/gitlgbt/forgejo/refs/heads/main/assets/logo.svg" alt="git.lgbt Logo" width="192" />
  <h1>gitlgbt/Theme</h1>
  <p><strong>Theme and page Source code for <a href="https://git.lgbt">git.lgbt</a></strong></p>
</div>

## Contributing

clone this repo
```bash
git clone https://github.com/gitlgbt/theme.git
cd theme
```

run and test locally
```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate
```

page will up at [http://localhost:3001/](http://localhost:3001/)
<br>
you will meet with install page on database choose SQLite3 (if it not by defalt already)
you can create admin account and start doing what ever you want to


stop docker 
```bash
docker stop $(docker ps -q)
sudo rm -rf .dev
```

### Copyright & Licenses

assets are under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
<br>
source code      [MIT](https://github.com/gitlgbt/theme/blob/main/LICENSE)
<br>
Copyright (C) 2026 git.lgbt Authors and contributors

---
<br>
<div align="center">
  <img src="https://raw.githubusercontent.com/gitlgbt/forgejo/refs/heads/main/assets/Fryrvo%20pride.svg" alt="Fryrvo Pride Logo" width="70" />
  <p><em>Currently Hosted at Fryrvo</em></p>
</div>