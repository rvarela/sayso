# SaySo

SaySo is a warm, mobile-first communication aid for people with aphasia and other speech difficulties. It lets a patient build a message through large guided choices, hear each selection, switch between word and visual modes, and replay the completed sentence.

The current prototype is deliberately simple: plain HTML, CSS and JavaScript, no account, no tracking, and no server dependency. Personal vocabulary and suggestion learning stay in the browser's local storage.

## Run locally

No build step is required.

```powershell
python -m http.server 4173 --directory site/dist
```

Then open <http://localhost:4173>.

## Deploy to a VPS

Copy the contents of `site/dist` to a web directory such as `/var/www/sayso`, then configure your web server to serve that directory.

Example Nginx configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name say.madebyshonen.com;

    root /var/www/sayso;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the configuration, test it, and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/sayso /etc/nginx/sites-enabled/sayso
sudo nginx -t
sudo systemctl reload nginx
```

## Connect a subdomain

1. In the DNS dashboard for `madebyshonen.com`, create an `A` record.
2. Set the host/name to the chosen subdomain, such as `say`.
3. Set its value to the public IPv4 address of the VPS. Add an `AAAA` record too if the VPS has IPv6.
4. Wait for DNS propagation, then verify with `nslookup say.madebyshonen.com`.
5. Once DNS resolves and Nginx is serving the site, enable HTTPS:

```bash
sudo certbot --nginx -d say.madebyshonen.com
```

Remember it as: **DNS points the name to the VPS; Nginx points the name to the app; Certbot adds HTTPS.**

## Publish on GitHub

Create an empty public repository on GitHub, then run from this directory:

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sayso.git
git push -u origin main
```

For updates on the VPS, either copy `site/dist` again or clone/pull the repository and point Nginx at the checked-out `site/dist` directory.

## Important note

SaySo is a communication aid, not a medical device. It should not replace professional medical advice or emergency communication systems.

## License

[MIT](LICENSE) — use, modify, and share it freely.
