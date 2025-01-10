# Nguvu Cloud Alpha
## The death to cpanel

### SSL Setup

[Certbot](https://certbot.eff.org/)


### Configure Server
copy nguvu-cloud.serice file and change the username by enviroment 
copy the serve.sh and `chmod+x serve.sh` in home directory

enable cloud service
```sudo systemctl enable nguvu-cloud.service```

start nguvu cloud 
```sudo systemctl start nguvu-cloud.service```


check the status of nguvu cloud
```sudo systemctl start nguvu-cloud.service```

check the logs (temporary)
```sudo journalctl -u nguvu-cloud.service -n10```s

### Roadmap 
[ ] Documentation
[ ] Remove -A flag
