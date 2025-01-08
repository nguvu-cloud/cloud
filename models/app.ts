export interface AppPorts {
  production: number;
  development: number;
  staging: number;
}

export interface App {
  name: string;
  path: string;
  port: AppPorts;
  hostname: string;
  description: string;
  icon: string;
  image: string;
}

export interface AppSettings {
  name: string;
  port: AppPorts;
  path: string;
  hostname: string;
  init: boolean;
}

export interface AppLoadEvent {
  detail: AppSettings;
}

export interface HostProcess {
  pid: number;
  port: number;
}
