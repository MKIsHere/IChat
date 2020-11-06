const express = require('express');
const path = require('path');

const fs = require('fs');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//const livereload = require("livereload");

const publicDirectory = path.join(__dirname, 'public');

//const liveReloadServer = livereload.createServer();
//liveReloadServer.watch(publicDirectory);
//const connectLivereload = require("connect-livereload");

/*
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
*/

//app.use(connectLivereload());
app.use(express.static(publicDirectory));
app.set('views', publicDirectory);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.get('/', (request, response) => {

	const date = new Date;
	let hours = (date.getHours() <= 9) ? "0" + date.getHours() : date.getHours(), minutes = (date.getMinutes() <= 9) ? "0" + date.getMinutes() : date.getMinutes(), seconds = (date.getSeconds() <= 9) ? "0" + date.getSeconds() : date.getSeconds();
	let time = `${hours}:${minutes}:${seconds}`;

	//console.log(`Request recebida às ${time}`);

	response.render('chat.html');
});

function fetchMessages () {
	let fetched = [];
	if (!fs.existsSync(`./messages.json`)) {
		fs.writeFileSync(`./messages.json`, JSON.stringify(fetched));
	} else {
	fetched = require(`./messages.json`);
	}

	return fetched;
}


let messages = fetchMessages();

const ytdl = require('ytdl-core');

io.on('connection', socket => {
	console.log(`Socket conectado: ${socket.id}`);

	socket.emit('previusMessages', messages);

	const date = new Date;
	let hours = (date.getHours() <= 9) ? "0" + date.getHours() : date.getHours(), minutes = (date.getMinutes() <= 9) ? "0" + date.getMinutes() : date.getMinutes(), seconds = (date.getSeconds() <= 9) ? "0" + date.getSeconds() : date.getSeconds();
	let time = `${hours}:${minutes}:${seconds}`;

	socket.on('sendMessage', data => {
		messages.push(data);
		
		fs.writeFileSync(`./messages.json`, JSON.stringify(messages));

		socket.broadcast.emit('receivedMessage', data);
	});
	socket.on('notifyMessage', data => {
		
		if (!data.receivedAt || !data.author) {
			return;
		}

		if (data.author != data.receivedAt && data.receivedAt && data.author) {
			console.log(`1 Mensagem recebida por ${data.author} em ${data.receivedAt}`);
			socket.emit('notification', data);
		}
	});

	const yts = require('./modules/mkishereoficial/yt_search');

	socket.on('getMusic', async (searched) => {
		let err = null;
		let finalPath = null;
		let video;

		try {
		video = await yts(searched);
		video = video.url;



		let path = './public/background-1.mp3';
		finalPath = '/background-1.mp3';

		if (!fs.existsSync(path)) {
			ytdl(video)
				.pipe(fs.createWriteStream(path));

				app.use('/background-1.mp3', (req, res) => {
					res.sendFile(__dirname + '/public/background-1.mp3');
				})

			console.log('mp3 created at ', path);
		}

		} catch (error) {
			err = error;
		}

		return socket.emit('receiveMusic', {
			err,
			cache: finalPath,
			video
		});
	});

});

console.log(`App Iniciado.`);

server.listen(3000);