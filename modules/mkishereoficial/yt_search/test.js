async function test() {
  const yts = await require('./main.js');
  let video = await yts('beabadoobee - Coffe for your head remix');

  console.log(video);
}

test();
