const wbm = require('wbm');

wbm.start().then(async () => {
    const phones = ['+6281212582659'];
    const message = 'The PIN is 2837';
    await wbm.send(phones, message);
    await wbm.end();
}).catch(err => console.log(err));