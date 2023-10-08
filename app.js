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

// let kontak = [
// 	{phone: "6281212582659", otp: "1821" },
// 	{phone: "6281283171617", otp: "1882" },
// 	{phone: "62811873100", otp: "8822" },
// 	{phone: "6281221925082", otp: "7382" }
// ];
// let orang = {phone: "6281212582659", otp: "1882" };
// kontak.push(orang);

// Mengambil data Countdown
app.get('/send', (req, res) => {

	let {destinasi, pesan} = req;

	wbm.send(destinasi, pesan).then(async () => {
		console.log('Done');
		res.json({
			code : "ok",
			msg : "Mengirim berhasil!"
		})
		return;
	}).catch( (err) => {
		console.log(`Failed Sending... (${err})`);
		res.json({
			code : "error",
			msg : "Mengirim gagal!"
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

