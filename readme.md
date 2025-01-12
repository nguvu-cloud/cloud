# Nguvu Cloud Alpha
## The death to cpanel

### SSL Setup

[Certbot](https://certbot.eff.org/)


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
