// WebServer Library untuk handle incoming client, etc.
const express = require('express');
const app = express();
// Port yang dipakai ExpressJS untuk menjalankan webserver listen()
const port = 800;

// Library Tambahan untuk melengkapi fitur yang dipakai
const cors = require('cors');
const wbm = require('wbm');

// Menggunakan CORS agar api dapat dipakai oleh siapa saja (tanpa perlu origin server)
app.use(cors())

wbm.start().then(async () => {
	console.log('WA Web is runnning...');
	return;
}).catch( (err) => {
	console.log('Gagal membuka browser!');
	console.log(err);
	return;
});

// To make sure terminal doesn't closed
var heartbeat = setInterval(function(str1, str2, str3) {
	console.log(str1 + str2 + str3);
}, 1000, "===", "Alive", "===");	

// Mengambil data Countdown
app.get('/send', (req, res) => {

	// Mengambil data query
	let {destinasi, pesan} = req.query;

	// Menyiapkan antrian
	let kontak = [
		{phone:destinasi, message:pesan}
	];

	wbm.send(kontak, `{{message}}`).then(async () => {
		console.log(`Pesan nomor ${destinasi} terkirim`);
		res.json({
			code : "ok",
			msg : `Mengirim ${destinasi} berhasil!`
		})
		return;
	}).catch( (err) => {
		console.log(`Pesan nomor ${destinasi} tidak terkirim! (${err})`);
		res.json({
			code : "error",
			msg : `Mengirim ${destinasi} gagal!`
		})
		return;
	});
	
});

// Menampilkan hasil error karena mengunjungi halaman yang tidak (Lost API url)
app.get('/*', (req, res) => {
	res.json({
		code : "error",
		msg : "API Invalid"
	})
});

// Menjalankan webserver ExpressJS
app.listen(port, () => {
  	console.log(`Server dengan port ${port} berjalan...`);
});

