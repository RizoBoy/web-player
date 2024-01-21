# Гайд по запуску сайта

В связи политики безопасности браузеров, визуалайзер не будет работать без сертификата SSL. Соотвественно, для запуска сайта локально потребуется выключить безопасный режим браузера. Для этого нужно:

1. Найти .exe файл google chrome или любой ярлык к нему.
2. Создать ярлык .exe и зайти в его свойства.
3. Во вкладке "Ярлык" добавить следующие аргументы к объекту: --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp
4. Должно получится примерно так: "C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp
5. Запустить созданный ярлык и поиске вписать локальный путь к сайту, пример: C:\Users\user\Documents\ИТМО\Мульт\web-app\index.html

После чего сайт должен полнолстью работать. Но можно просто перейти по ссылке: https://rizoboy.github.io/web-player/ ;)
