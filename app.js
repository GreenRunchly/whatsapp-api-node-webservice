// DotEnv Config
require('dotenv').config(); // Load Configuration

// WebServer Library untuk handle incoming client, etc.
const express = require('express');
const app = express();
// Port yang dipakai ExpressJS untuk menjalankan webserver listen()
const port = 800;

// Library Tambahan untuk melengkapi fitur yang dipakai
const cors = require('cors');
const wbm = require('wbm');
const alat = require('./module-tools');

// Module untuk Validasi input
const mdvld = require('express-validator');
function mdvldResult(req, res, next) {
    // Validasi Input
    const errorValidasiInput = mdvld.validationResult(req);
    if (!errorValidasiInput.isEmpty()) { // Jika tidak ada error
        res.status(200).json({
			code : 'error',
            msg : errorValidasiInput.errors[0].msg
        });
        return true;
    }else{
        return false;
    }
}

// Menggunakan CORS agar api dapat dipakai oleh siapa saja (tanpa perlu origin server)
app.use(cors());

// Koneksi mysql
const mysql = require('mysql2');

// Membuat koneksi db secara pooling
const pooldb = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
	multipleStatements: true
});

wbm.start().then(async () => {
	console.log('WA Web is runnning...');
	return;
}).catch( (err) => {
	console.log('Gagal membuka browser!');
	console.log(err);
	return;
});

// To make sure terminal doesn't closed
let heartBeatStop = false;
let heartBeat = setInterval(function(str1, str2, str3) {
	
	// Jika beat tidak berhenti
	if (heartBeatStop == false){

		// Memberhentikan heartbeat
		heartBeatStop = false;

		// Mengecek pesan yang ada
		let sqlsyn = `
			SELECT * FROM tb_wa_message WHERE status=? ORDER BY created ASC LIMIT 10;
			UPDATE tb_wa_message 
			SET status=?
			WHERE status=? ORDER BY created ASC LIMIT 10;
			
		`;
		pooldb.query(sqlsyn, ['pending', 'sending', 'pending'], (err, result) => {
			
			let antri = result[0];

			// Mengambil data antrian
			if (err){ 
				// Menampilkan error terjadi
				console.log(err);
			} else if ((antri.length === 0)){ 
				// Kosong
				console.log(`Tidak ada data.`);
			} else {
				// Memiliki hasil timbal balik
				// Menyiapkan antrian 
				let kontak = [];

				// Memisahkan kontak dengan pesan
				antri.forEach(datarequest => {
					let orang = {phone:(datarequest.wa_number), message:datarequest.message };
					kontak.push(orang);
				});

				wbm.send(kontak, `{{message}}`).then(async () => {
					console.log(`Pesan terkirim`);
					return;
				}).catch( (err) => {
					console.log(`Pesan tidak terkirim! (${err})`);
					return;
				});
			}

			// Menampilkan waktu, tanggal dan jumlah pesan yang dapat dikirimkan
			let heartBeatTime = new Date();
			console.log(`${heartBeatTime} ${str1} ${str2} (${antri.length}) ${str3}`);

		});
	}
}, 60000, "----", `Mengecek Pesan Terbaru`, "----");	

// Mengambil data Countdown
app.get('/send', [
    mdvld.query('destinasi').not().isEmpty().withMessage('Masukan nomor telepon!').trim().escape(),
	mdvld.query('pesan').not().isEmpty().withMessage('Harap isi pesan!').trim().escape()
], (req, res) => {

	// Cek Error pada validasi input
    if ( mdvldResult(req, res) ){ // Jika ditemukan masalah akan return true
        return; // Untuk menghentikan eksekusi lanjutan
    }

	// Mengambil data dari query
	let {destinasi, pesan} = req.query;

	// Convert ke angka saja
	destinasi = destinasi.replace(/\D+/g, '');

	// Menambahkan antrian ke db
	let sqlsyn = `
	INSERT INTO tb_wa_message (api_key_id, wa_number, message) VALUES (?, ?, ?)
	`;
	pooldb.query(sqlsyn, [1, destinasi, pesan], (err, result) => {
		// Mengambil data antrian
		if (err){ 
			// Menampilkan error terjadi
			console.log(err);
		} else {
			res.json({
				code : "ok",
				msg : "Antrian ditambahkan!"
			});
		}
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

