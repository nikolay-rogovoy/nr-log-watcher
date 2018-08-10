"use strict"
import {create} from 'domain';
import {LogWatcher} from "./log-watcher";

(function main() {

    /***/
    console.log('run app main()');

    let serverDomain = create();
    serverDomain.on('error',
        (err) => {
                console.log(`serverDomain: Ошибка: ${err.name}\nсообщение: ${err.message}\n${err.stack}`);
        }
    );

    // Запуск сервера
    serverDomain.run(
        () => {
            new LogWatcher();
        });

})();
