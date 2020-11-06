const version = require("./package.json").version;

const yts = require( 'yt-search' );

let language = "pt";
let translate = require('@vitalets/google-translate-api');
async function traduzir (value) {
	let data = "Unavailable";
	/*await translate(value, {to: language}).then(async (res) => {
		data = res.text;
	})*/
	data = value;
	return data;
}

async function search (value) {
	if (!value) throw new Error("O Valor da Pesquisa não foi identificado. VVerifique se é uma String.");

	const r = await yts(value);

	const videos = r.videos.slice( 0, 5 );

	let video = videos[0];

	let obj = {
		duration: video.timestamp,
		title: video.title,
		url: video.url,
		id: video.videoId,
		description: video.description,
		imageURL: function get () {
			return video.image;
		},
		thumbnailURL: function get () {
			return video.thumbnail;
		},
		ago: (async (event) => {
			let a = video.ago;
			let b = await traduzir("Indisponível");

			if (!a) {
				return b;
			}

			await translate(a, {to: language}).then(res => {
				return b = res.text;
			}).catch(err => {
    		throw console.error(err);
			});

      if (language != "en") {
			     return b;
      }

      return a;
		})(),
		author: {
			name: video.author.name,
			url: video.author.url,
			},

		views: video.views.toLocaleString(),
		downloadURL: function get () {
			let url = `https://www.y2mate.com/pt/youtube/${this.id}`;

			return url;
		}

	};

  return obj;
}
async function multi_search(searchValue, maxVideos) {
	if (searchValue.length <= 0) throw new Error("O Valor da Pesquisa não foi identificado. Verifique se é uma String.");

	if (!maxVideos) {
		console.log(`Você não espeficou o parâmetro maxVideos. Este deve ser um número, no qual especifica-se o número máximo de vídeos no array.`)
		maxVideos = 5;
	} else if (isNaN(maxVideos)) {
		throw new Error("O parâmetro maxVideos deve ser um número, no qual especifica-se o número máximo de vídeos no array.");
	}

	const r = await yts(searchValue);
	if (!r.videos) throw new Error("Nenhum vídeo foi encontrado.");

	const vids = r.videos.slice( 0, maxVideos );
	const videos = await vids.map(async (video) => {
		const obj = {
			duration: video.timestamp,
			title: video.title,
			url: video.url,
			id: video.videoId,
			description: video.description,
			imageURL: function get () {
				return video.image;
			},
			thumbnailURL: function get () {
				return video.thumbnail;
			},
			ago: (async (event) => {
				let a = video.ago;
				let b = await traduzir("Indisponível");

				if (!a) {
					return b;
				}

				await translate(a, {to: language}).then(res => {
					return b = res.text;
				}).catch(err => {
	    		throw console.error(err);
				});

	      if (language != "en") {
				     return b;
	      }

	      return a;
			})(),
			author: {
				name: video.author.name,
				url: video.author.url,
				},

			views: video.views.toLocaleString(),
			downloadURL: function get () {
				let url = `https://www.y2mate.com/pt/youtube/${this.id}`;

				return url;
			}

		};

	  return obj;
	});

	if (!videos) throw new Error("Nenhum vídeo foi encontrado.");

	return videos;
}

module.exports = search;
module.exports.multi = multi_search;
module.exports.search = multi_search;
module.exports.language = language;
module.exports.version = version;
