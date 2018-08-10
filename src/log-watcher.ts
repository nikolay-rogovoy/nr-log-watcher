import * as fs from 'fs'
import {Stats} from "fs";
import config from './config/config';
import {ClientBase} from "./http-client/client-base";
import {HttpClient} from "./http-client/http-client";
import {HttpsClient} from "./http-client/https-client";

/***/
export class LogWatcher {

    /***/
    fileName = config.get('log_watcher:fileName');

    /***/
    dirName = config.get('log_watcher:dirName');

    /***/
    get fullFileName(): string {
        return `${this.dirName}/${this.fileName}`;
    }

    logServer: ClientBase;

    /***/
    constructor() {
        if (config.get('log_server:protocol') === 'http') {
            this.logServer = new HttpClient(config.get('log_server:host'), config.get('log_server:port'))
        } else if (config.get('log_server:protocol') === 'https') {
            this.logServer = new HttpsClient(config.get('log_server:host'), config.get('log_server:port'))
        } else {
            throw new Error(`protocol ${config.get('log_server:protocol')} invalid`);
        }
        this.logServer.token = config.get('log_server:token');
        this.createWatchFile();
        fs.watch(this.dirName, (eventType, filename) => {
            if (filename === this.fileName && eventType === 'rename') {
                fs.unwatchFile(this.fileName, () => {
                    this.createWatchFile();
                });
            }
        });
    }

    /***/
    createWatchFile() {
        fs.watchFile(this.fullFileName, (curr: Stats, prev: Stats) => {
                if (curr.mtime !== prev.mtime) {
                    const startPos = prev.size;
                    const endPos = curr.size;
                    const readStream = fs.createReadStream(this.fullFileName, {start: startPos, end: endPos});
                    readStream.on('readable', () => {
                        let buf;
                        while (buf = readStream.read()) {
                            // todo сделать сохранение лога и отправка его по возможности
                            this.logServer.postHttp(`/${config.get('log_server:api')}/textlog`, {
                                    "rule": config.get('log_server:rule'),
                                    "data": buf.toString()
                                }
                            ).subscribe((postResult) => {
                                    console.log('passed >> ', postResult);
                                },
                                (error) => {
                                    console.log('error passed >> ', error);
                                });
                        }
                    });
                }
            }
        );
    }
}
