const run = async () => {
  const domain = 'https://ciphersprint.pulley.com/';
  const email = 'jonopenshaw@gmail.com';
  const initUrl = domain + email;

  const getEncodedPathChunk = (string, splitChar) => string.split(splitChar)[1] || '';
  const getAsciiMoveAmount = (string) => {
    const num = string.split(' ')[1];

    return parseInt(num);
  };

  const callToJson = async (url) => {
    const res = await fetch(url);
    const jsonOut = await res.json();

    console.log('url: ', url);
    console.log('output: ',jsonOut);

    responses.push(jsonOut);

    return jsonOut;
  };

  const decodedBase64Path = (encryptedPath) => {
    const encodedChunk = getEncodedPathChunk(encryptedPath, '_');

    if (!encodedChunk) return null;

    return `task_${atob(encodedChunk)}`;
  }

  const swapCharPositionPath = (encryptedPath) => {
    const swapChunk = getEncodedPathChunk(encryptedPath, '_');

    if (!swapChunk) return null;

    let result = '';

    for (let i = 0; i < swapChunk.length; i += 2) {
      let head = swapChunk[i];
      let tail = swapChunk[i + 1] || '';

      result = result + tail + head;
    }

    return `task_${result}`;
  }

  const subtractFromAsciiCharCode = (encryptedPath, method) => {
    const asciiChunk = getEncodedPathChunk(encryptedPath, '_');
    const offset = getAsciiMoveAmount(method);

    const movedAsciiString = asciiChunk.split('').map((char) => {
      const charCode = char.charCodeAt(0);

      return String.fromCharCode(charCode - offset);
    }).join('');

    return `task_${movedAsciiString}`;
  }

  const lvlZero = await callToJson(initUrl);

  const lvlOne = await callToJson(`${domain}${lvlZero.encrypted_path}`);

  const lvlTwoUrlPath = decodedBase64Path(lvlOne.encrypted_path);

  const lvlTwo = await callToJson(`${domain}${lvlTwoUrlPath}`);

  const lvlThreeUrlPath = swapCharPositionPath(lvlTwo.encrypted_path);

  const lvlThree = await callToJson(`${domain}${lvlThreeUrlPath}`);

  const lvlFourUrlPath = subtractFromAsciiCharCode(lvlThree.encrypted_path, lvlThree.encryption_method);

  const lvlFour = await callToJson(`${domain}${lvlFourUrlPath}`);
}






const responses = [];

const getEncodedPathChunk = (string, splitChar) => string.split(splitChar)[1] || '';

const getAsciiMoveAmount = (string) => parseInt(string.split(' ')[1]);

const decodedBase64Path = (encryptedPath) => {
  const encodedChunk = getEncodedPathChunk(encryptedPath, '_');

  if (!encodedChunk) return null;

  return `task_${atob(encodedChunk)}`;
}

const swapCharPositionPath = (encryptedPath) => {
  const swapChunk = getEncodedPathChunk(encryptedPath, '_');

  if (!swapChunk) return null;

  let result = '';

  for (let i = 0; i < swapChunk.length; i += 2) {
    let head = swapChunk[i];
    let tail = swapChunk[i + 1] || '';

    result = result + tail + head;
  }

  return `task_${result}`;
}

const subtractNineFromAsciiCharCode = (encryptedPath) => {
  const asciiChunk = getEncodedPathChunk(encryptedPath, '_');

  const movedAsciiString = asciiChunk.map((char) => {
    const charCode = char.charCodeAt(0);

    return String.fromCharCode(charCode - 9);
  });

  return `task_${movedAsciiString}`;
}

// const levels = [
//   {
//     id: 0,
//     decrypt: null,
//   },
//   {
//     id: 1,
//     decrypt: decodedBase64Path,
//   },
//   {
//     id: 2,
//     decrypt: swapCharPositionPath,
// ];

const callToJson = async (url) => {
  const res = await fetch(url);
  const jsonOut = await res.json();

  console.log('url: ', url);
  console.log('output: ',jsonOut);

  responses.push(jsonOut);

  return jsonOut;
};




/*

- make call
- perform action - "decrypt"
- build URL

level 0
get encrypted_path

level 1
atob encrypted_path and append to email

 encryption_methods
 - nothing
 - base64

level 2
 - char swap

*/