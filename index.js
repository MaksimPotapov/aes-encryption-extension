function AES_Init() {
  AES_Sbox_Inv = new Array(256);
  for (var i = 0; i < 256; i++)
    AES_Sbox_Inv[AES_Sbox[i]] = i;

  AES_ShiftRowTab_Inv = new Array(16);
  for (var i = 0; i < 16; i++)
    AES_ShiftRowTab_Inv[AES_ShiftRowTab[i]] = i;

  AES_xtime = new Array(256);
  for (var i = 0; i < 128; i++) {
    AES_xtime[i] = i << 1;
    AES_xtime[128 + i] = (i << 1) ^ 0x1b;
  }
}

function AES_Done() {
  delete AES_Sbox_Inv;
  delete AES_ShiftRowTab_Inv;
  delete AES_xtime;
}

function AES_ExpandKey(key) {
  var kl = key.length, ks, Rcon = 1;
  switch (kl) {
    case 16: ks = 16 * (10 + 1); break;
    case 24: ks = 16 * (12 + 1); break;
    case 32: ks = 16 * (14 + 1); break;
    default:
      alert("AES_ExpandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
  }
  for (var i = kl; i < ks; i += 4) {
    var temp = key.slice(i - 4, i);
    if (i % kl == 0) {
      temp = new Array(AES_Sbox[temp[1]] ^ Rcon, AES_Sbox[temp[2]], AES_Sbox[temp[3]], AES_Sbox[temp[0]]);
      if ((Rcon <<= 1) >= 256) { Rcon ^= 0x11b; }
    } else if ((kl > 24) && (i % kl == 16)) {
      temp = new Array(AES_Sbox[temp[0]], AES_Sbox[temp[1]], AES_Sbox[temp[2]], AES_Sbox[temp[3]]);
    }
    for (var j = 0; j < 4; j++) {
      key[i + j] = key[i + j - kl] ^ temp[j];
    }
  }
}

function AES_Encrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(0, 16));
  for (var i = 16; i < l - 16; i += 16) {
    AES_SubBytes(block, AES_Sbox);
    AES_ShiftRows(block, AES_ShiftRowTab);
    AES_MixColumns(block);
    AES_AddRoundKey(block, key.slice(i, i + 16));
  }
  AES_SubBytes(block, AES_Sbox);
  AES_ShiftRows(block, AES_ShiftRowTab);
  AES_AddRoundKey(block, key.slice(i, l));
}

function AES_Decrypt(block, key) {
  var l = key.length;
  AES_AddRoundKey(block, key.slice(l - 16, l));
  AES_ShiftRows(block, AES_ShiftRowTab_Inv);
  AES_SubBytes(block, AES_Sbox_Inv);
  for (var i = l - 32; i >= 16; i -= 16) {
    AES_AddRoundKey(block, key.slice(i, i + 16));
    AES_MixColumns_Inv(block);
    AES_ShiftRows(block, AES_ShiftRowTab_Inv);
    AES_SubBytes(block, AES_Sbox_Inv);
  }
  AES_AddRoundKey(block, key.slice(0, 16));
}

AES_Sbox = new Array(99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
  118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253,
  147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154,
  7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227,
  47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170,
  251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
  188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61,
  100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224,
  50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213,
  78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221,
  116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29,
  158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161,
  137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22);

AES_ShiftRowTab = new Array(0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11);

function AES_SubBytes(state, sbox) {
  for (var i = 0; i < 16; i++) {
    state[i] = sbox[state[i]];
  }
}

function AES_AddRoundKey(state, rkey) {
  for (var i = 0; i < 16; i++)
    state[i] ^= rkey[i];
}

function AES_ShiftRows(state, shifttab) {
  var h = new Array().concat(state);
  for (var i = 0; i < 16; i++)
    state[i] = h[shifttab[i]];
}

function AES_MixColumns(state) {
  for (var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    state[i + 0] ^= h ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h ^ AES_xtime[s3 ^ s0];
  }
}

function AES_MixColumns_Inv(state) {
  for (var i = 0; i < 16; i += 4) {
    var s0 = state[i + 0], s1 = state[i + 1];
    var s2 = state[i + 2], s3 = state[i + 3];
    var h = s0 ^ s1 ^ s2 ^ s3;
    var xh = AES_xtime[h];
    var h1 = AES_xtime[AES_xtime[xh ^ s0 ^ s2]] ^ h;
    var h2 = AES_xtime[AES_xtime[xh ^ s1 ^ s3]] ^ h;
    state[i + 0] ^= h1 ^ AES_xtime[s0 ^ s1];
    state[i + 1] ^= h2 ^ AES_xtime[s1 ^ s2];
    state[i + 2] ^= h1 ^ AES_xtime[s2 ^ s3];
    state[i + 3] ^= h2 ^ AES_xtime[s3 ^ s0];
  }
}



function cryptAES(text, key) {
  AES_Init();
  let t = String(text).split('');
  t = t.map((el) => el.charCodeAt());
  let k = [...String(key).split(''), ...Array(32 - String(key).length)];
  k = k.map((el, i) => {
    if (el) return el.charCodeAt();
    return i;
  });
  AES_ExpandKey(k);
  AES_Encrypt(t, k);
  AES_Done();
  return t;
}

function decryptAES(text, key) {
  AES_Init();
  t = [...text];
  let k = [...String(key).split(''), ...Array(32 - String(key).length)];
  k = k.map((el, i) => {
    if (el) return el.charCodeAt();
    return i;
  });
  AES_ExpandKey(k);
  AES_Decrypt(t, k);
  AES_Done();
  const result = String.fromCharCode(...t);
  return result.replace(/\0/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  const textField = document.querySelector('#text');
  const keyField = document.querySelector('#key');
  const result = document.querySelector('#result');
  const check = document.querySelector('#check');
  const showResult = document.querySelectorAll('.show-result');
  document.addEventListener('keydown', (el) => {
    if (!el.ctrlKey && !el.shiftKey && !el.altKey) {
      result.innerText = '';
      check.innerText = '';
    }
    if (el.keyCode === 13) {
      let text;
      let key = keyField.value;
      try {
        text = JSON.parse(textField.value);
      } catch  {
        text = textField.value;
      }
      if (!!key && (typeof text === 'string' || typeof text === 'number')) {
        const crypt = cryptAES(text, key);
        result.innerText = JSON.stringify(crypt);
        check.innerText = decryptAES(crypt, key);
      } else if (!!key && Object.prototype.toString.call(text).slice(8, -1) === 'Array') {
        result.innerText = decryptAES(text, key);
      };
    }
  });
  result.addEventListener('click', (el) => {
    const fieldCopyText = document.createElement('input');
    fieldCopyText.setAttribute('value', result.innerText);
    fieldCopyText.style.opacity = 0;
    document.querySelector('body').appendChild(fieldCopyText);
    fieldCopyText.select();
    document.execCommand('copy');
    fieldCopyText.remove();
    showResult[0].classList.remove('hide');
    result.innerText = 'Result saved to clipboard';
    setTimeout(() => {
      result.innerText = '';
      showResult[0].classList.add('hide');
    }, 3000);
  })
  showResult.forEach((el) => {
    el.addEventListener('click', ({ target }) => {
      target.classList.remove('hide');
      setTimeout(() => { target.classList.add('hide'); }, 500);
    });
  });
});