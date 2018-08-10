/**Запрос к нашему бэк энду*/
import {IncomingMessage, RequestOptions} from "http";
import {Observable} from "rxjs/Observable";

/***/
export abstract class ClientBase {

    /***/
    private _token;

    /***/
    set token(value) {
        this._token = value;
    }

    /***/
    get token() {
        return this._token;
    }

    /***/
    constructor(public hostname: string,
                public port: number) {
    }

    /***/
    getHttp(path): Observable<any> {
        throw new Error('Not implemented');
    }

    /***/
    getAuthorizationHeader(): Object {
        if (this.token) {
            return {'Authorization': `Bearer<${this.token}>`}
        } else {
            return {};
        }
    }

    /***/
    getOptions(path: string): RequestOptions {
        return <RequestOptions>{
            hostname: this.hostname,
            headers: this.getHeaders(),
            port: this.port,
            path: path,
            agent: false
        };
    }

    /***/
    getHeaders(): Object {
        let result = {};
        result = Object.assign(result, this.getAuthorizationHeader());
        return result;
    }

    /***/
    getPostOptions(path: string, contentLength: number): RequestOptions {
        return <RequestOptions>{
            hostname: this.hostname,
            port: this.port,
            path: path,
            method: 'POST',
            agent: false,
            headers: this.getPostHeaders(contentLength)
        };
    }

    /***/
    getPostHeaders(contentLength: number): Object {
        let result = {
            'Content-Type': 'application/json',
            'Content-Length': contentLength
        };
        result = Object.assign(result, this.getAuthorizationHeader());
        return result;
    }

    /***/
    getErrorIncomingMessage(incomingMessage: IncomingMessage) {
        const {statusCode} = incomingMessage;
        const contentType = incomingMessage.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error(`Ошибка запроса Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Не правильный content-type. Ожидается application/json получен: ${contentType}`);
        }
        return error;
    }

    /***/
    extractData<T extends Object>(incomingMessage: IncomingMessage, callback: Function): void {
        // Извлекаем данные
        incomingMessage.setEncoding('utf8');
        let rawData = '';
        incomingMessage.on('data', (chunk) => {
            rawData += chunk;
        });
        incomingMessage.on('end', () => {
            try {
                let parsedData = JSON.parse(rawData);
                callback(null, parsedData);
            } catch (error) {
                callback(new Error(`Ошибка разбора ответа сервера ${rawData} \n ${error.message}`));
            }
        });
        incomingMessage.resume();
    }

    /***/
    postHttp<T extends Object>(path: string, value: string | T): Observable<any> {
        throw new Error('Not implemented');
    }

    /***/
    getPostString<T extends Object>(value: string | T): string {
        let valueString: string;
        if (typeof value === 'object') {
            valueString = JSON.stringify(value);
        } else {
            valueString = value;
        }
        return valueString;
    }
}
