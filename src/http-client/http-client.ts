/**Запрос к нашему бэк энду*/
import * as http from "http";
import {IncomingMessage} from "http";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import {bindNodeCallback} from "rxjs/observable/bindNodeCallback";
import {switchMap} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";
import {of} from "rxjs/observable/of";
import {bindCallback} from "rxjs/observable/bindCallback";
import {ClientBase} from "./client-base";

/***/
export class HttpClient extends ClientBase {

    /***/
    constructor(hostname: string,
                port: number) {
        super(hostname, port)
    }

    /***/
    getHttp(path): Observable<any> {
        return bindCallback(http.get)(this.getOptions(path))
            .pipe(
                switchMap((incomingMessage: IncomingMessage) => {
                    return bindNodeCallback(this.extractData)(incomingMessage)
                        .pipe(switchMap((incomingData) => {
                                let errorIncomingMessage = this.getErrorIncomingMessage(incomingMessage);
                                if (errorIncomingMessage) {
                                    return _throw(incomingData);
                                } else {
                                    return of(incomingData);
                                }
                            })
                        );
                })
            );
    }

    /***/
    postHttp<T extends Object>(path: string, value: string | T): Observable<any> {
        if (value == null) {
            throw new Error('value is null');
        }
        let valueString = this.getPostString(value);
        return Observable.create((observer: Observer<any>) => {
            let clientRequest = http.request(this.getPostOptions(path, Buffer.byteLength(valueString)),
                (incomingMessage: IncomingMessage) => {
                    observer.next(incomingMessage);
                    observer.complete();
                })
                .on('error', (error) => {
                    observer.error(error);
                });
            clientRequest.write(valueString);
            clientRequest.end();
        })
            .pipe(
                switchMap((incomingMessage: IncomingMessage) => {
                    return bindNodeCallback(this.extractData)(incomingMessage)
                        .pipe(switchMap((incomingData) => {
                                let errorIncomingMessage = this.getErrorIncomingMessage(incomingMessage);
                                if (errorIncomingMessage) {
                                    return _throw(incomingData);
                                } else {
                                    return of(incomingData);
                                }
                            })
                        );
                })
            );
    }
}
