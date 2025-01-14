# Nguvu Cloud Alpha
## The death to cpanel

First Class support for [Rocky Linux 9](https://rockylinux.org/)
Built on [deno](https://deno.com/), the JavaScript runtime for the modern web.

### Setup Unzip
```sudo dnf install unzip ```

### Setup Deno
```curl -fsSL https://deno.land/install.sh | sh```


### SSL Setup

[Certbot](https://certbot.eff.org/instructions?ws=webproduct&os=pip&tab=wildcard)


### Setup Nguvu Cloud Serice 

```deno run --allow-net --allow-read --allow-write --allow-run jsr:@nguvu/cloud/setup --username={computer username}```

### Deploy App 

```deno run -A jsr:@nguvu/cloud/deploy --hostname=domain.tld```


### Configure Server
copy nguvu-cloud.serice file and change the username by enviroment 
copy the serve.sh and `chmod +x serve.sh` in home directory

[systemd](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)
enable cloud service
```sudo systemctl enable nguvu-cloud.service```

start nguvu cloud 
```sudo systemctl start nguvu-cloud.service```


check the status of nguvu cloud
```sudo systemctl status nguvu-cloud.service```

check the logs (temporary)
```sudo journalctl -u nguvu-cloud.service -n10```

### Roadmap
- [ ] Documentation
- [ ] Remove -A flag
- [ ] Website Security 
- [ ] API Security
- [ ] Make the setup files one one 
- [ ] Possible support for [Deco](https://github.com/deco-cx/deco)
