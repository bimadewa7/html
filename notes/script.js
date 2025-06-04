const board = document.getElementById('board');
const noteForm = document.getElementById('noteForm');
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');

const contentTypeSelect = document.getElementById('contentType');

const textInputContainer = document.getElementById('textInputContainer');
const musicInputContainer = document.getElementById('musicInputContainer');
const imageInputContainer = document.getElementById('imageInputContainer');
const voiceInputContainer = document.getElementById('voiceInputContainer');
const linkInputContainer = document.getElementById('linkInputContainer');

const noteText = document.getElementById('noteText');
const mediaLink = document.getElementById('mediaLink');
const imageUpload = document.getElementById('imageUpload');
const webLink = document.getElementById('webLink');

const startRecordBtn = document.getElementById('startRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const voicePlayback = document.getElementById('voicePlayback');

const addContentBtn = document.getElementById('addContentBtn');
const contentsPreview = document.getElementById('contentsPreview');

const submitNoteBtn = document.getElementById('submitNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');

let currentEditNote = null;
let tempPos = null;
let voiceBlobUrl = null;
let recordedChunks = [];
let mediaRecorder = null;

let noteContents = []; // isi sementara sebelum submit

// Variabel untuk fitur membesarkan note
let isNoteZoomed = false;
let zoomedNote = null;
let originalStyles = null;

function onContentTypeChange() {
  const type = contentTypeSelect.value;
  textInputContainer.style.display = (type === 'text') ? 'block' : 'none';
  musicInputContainer.style.display = (type === 'music') ? 'block' : 'none';
  imageInputContainer.style.display = (type === 'image') ? 'block' : 'none';
  voiceInputContainer.style.display = (type === 'voice') ? 'block' : 'none';
  linkInputContainer.style.display = (type === 'link') ? 'block' : 'none';
}
contentTypeSelect.addEventListener('change', onContentTypeChange);

// Rekaman suara
startRecordBtn.onclick = () => {
  recordedChunks = [];
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    startRecordBtn.disabled = true;
    stopRecordBtn.disabled = false;

    mediaRecorder.ondataavailable = e => {
      if(e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      if(voiceBlobUrl) URL.revokeObjectURL(voiceBlobUrl);
      voiceBlobUrl = URL.createObjectURL(blob);
      voicePlayback.src = voiceBlobUrl;
      voicePlayback.style.display = 'block';
      stream.getTracks().forEach(track => track.stop());
    };
  }).catch(err => alert('Gagal akses mikrofon: ' + err));
};

stopRecordBtn.onclick = () => {
  if(mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
  }
};

// Tambah isi note ke preview dan array
addContentBtn.onclick = () => {
  const type = contentTypeSelect.value;
  if(type === 'text') {
    const text = noteText.value.trim();
    if(!text) {
      alert('Isi pesan teks tidak boleh kosong');
      return;
    }
    noteContents.push({ type:'text', content: text });
    noteText.value = '';
  } else if(type === 'music') {
    const link = mediaLink.value.trim();
    if(!link) {
      alert('Isi URL musik tidak boleh kosong');
      return;
    }
    noteContents.push({ type:'music', content: link });
    mediaLink.value = '';
  } else if(type === 'image') {
    const file = imageUpload.files[0];
    if(!file) {
      alert('Pilih gambar dulu');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      noteContents.push({ type:'image', content: e.target.result });
      updateContentsPreview();
    };
    reader.readAsDataURL(file);
    imageUpload.value = '';
    return; // return supaya updateContentsPreview dipanggil setelah file load
  } else if(type === 'voice') {
    if(!voiceBlobUrl) {
      alert('Rekam suara dulu');
      return;
    }
    noteContents.push({ type:'voice', content: voiceBlobUrl });
    voicePlayback.style.display = 'none';
    voicePlayback.src = '';
    voiceBlobUrl = null;
  } else if(type === 'link') {
    const link = webLink.value.trim();
    if(!link) {
      alert('Isi link web tidak boleh kosong');
      return;
    }
    noteContents.push({ type:'link', content: link });
    webLink.value = '';
  }
  updateContentsPreview();
};

function updateContentsPreview() {
  contentsPreview.innerHTML = '';
  noteContents.forEach((item, i) => {
    const div = document.createElement('div');
    div.dataset.index = i;

    if(item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.content;
      div.appendChild(img);
    }
    let textContent = '';
    if(item.type === 'text') textContent = item.content;
    else if(item.type === 'music') textContent = 'Musik: ' + item.content;
    else if(item.type === 'voice') textContent = 'Voice Note';
    else if(item.type === 'link') textContent = 'Link Web: ' + item.content;

    if(textContent) {
      const p = document.createElement('p');
      p.textContent = textContent;
      div.appendChild(p);
    }

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('removeContentBtn');
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
      noteContents.splice(i, 1);
      updateContentsPreview();
    };
    div.appendChild(removeBtn);

    contentsPreview.appendChild(div);
  });
}

// Simpan atau update note
submitNoteBtn.onclick = () => {
  if(noteContents.length === 0) {
    alert('Isi minimal satu konten pada note');
    return;
  }

  if(currentEditNote) {
    currentEditNote.dataset.contents = JSON.stringify(noteContents);
    renderNoteContents(currentEditNote);
    currentEditNote = null;
  } else if(tempPos) {
    createNote(tempPos.x, tempPos.y, noteContents);
  }

  closeForm();
};

// Batalkan form
cancelNoteBtn.onclick = () => {
  closeForm();
};

function closeForm() {
  noteForm.style.display = 'none';
  noteContents = [];
  updateContentsPreview();
  currentEditNote = null;
  tempPos = null;
  resetFormInputs();
}

function resetFormInputs() {
  noteText.value = '';
  mediaLink.value = '';
  imageUpload.value = '';
  webLink.value = '';
  voicePlayback.style.display = 'none';
  voicePlayback.src = '';
  voiceBlobUrl = null;
  startRecordBtn.disabled = false;
  stopRecordBtn.disabled = true;
  contentTypeSelect.value = 'text';
  onContentTypeChange();
}

// Buat note baru di papan
function createNote(x, y, contents) {
  const note = document.createElement('div');
  note.classList.add('note');
  note.dataset.contents = JSON.stringify(contents);

  // Pin untuk menu edit/hapus
  const pin = document.createElement('div');
  pin.classList.add('pin');
  pin.title = 'Menu Note';
  pin.onclick = e => {
    e.stopPropagation();
    togglePinMenu(note, pin);
  };

  note.appendChild(pin);
  board.appendChild(note);
  renderNoteContents(note);
  positionNote(note, x, y);

  // Klik note untuk zoom popup
  note.onclick = e => {
    if(isNoteZoomed) return;
    e.stopPropagation();
    zoomNote(note);
  };
}

// Render isi note sesuai data contents
function renderNoteContents(note) {
  // Hapus semua isi kecuali pin
  [...note.childNodes].forEach(child => {
    if(!child.classList || !child.classList.contains('pin')) {
      child.remove();
    }
  });

  const contents = JSON.parse(note.dataset.contents || '[]');

  // Foto di atas
  const images = contents.filter(c => c.type === 'image');
  images.forEach(item => {
    const img = document.createElement('img');
    img.src = item.content;
    img.alt = 'Foto';
    note.insertBefore(img, note.querySelector('.pin'));
  });

  // Isi lain (text, music, voice, link)
  const others = contents.filter(c => c.type !== 'image');
  others.forEach(item => {
    if(item.type === 'text') {
      const p = document.createElement('p');
      p.innerHTML = linkify(item.content);
      note.insertBefore(p, note.querySelector('.pin'));
    } else if(item.type === 'music') {
      const iframe = createMusicEmbed(item.content);
      if(iframe) note.insertBefore(iframe, note.querySelector('.pin'));
      else {
        const a = document.createElement('a');
        a.href = item.content;
        a.target = '_blank';
        a.textContent = item.content;
        note.insertBefore(a, note.querySelector('.pin'));
      }
    } else if(item.type === 'voice') {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = item.content;
      note.insertBefore(audio, note.querySelector('.pin'));
    } else if(item.type === 'link') {
      const a = document.createElement('a');
      a.href = item.content;
      a.target = '_blank';
      a.textContent = item.content;
      note.insertBefore(a, note.querySelector('.pin'));
    }
  });

  // Sesuaikan ukuran note otomatis
  note.style.width = 'auto';
  note.style.height = 'auto';
  if(note.offsetWidth > 250) note.style.width = '250px';
  if(note.offsetHeight > 350) note.style.height = '350px';
}

// Membuat link clickable di pesan teks
function linkify(text) {
  const urlRegex = /((https?:\/\/[^\s]+))/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// Membuat embed musik iframe (Spotify atau YouTube)
function createMusicEmbed(url) {
  let embedUrl = '';
  let iframe = document.createElement('iframe');
  iframe.setAttribute('allow', 'encrypted-media');
  iframe.setAttribute('allowfullscreen', '');
  iframe.style.width = '100%';
  iframe.style.height = '80px';
  iframe.style.border = 'none';

  if(url.includes('open.spotify.com')) {
    const match = url.match(/open.spotify.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if(match) {
      embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
      iframe.src = embedUrl;
      return iframe;
    }
  }

  if(url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = null;
    if(url.includes('youtube.com')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if(url.includes('youtu.be')) {
      const parts = url.split('/');
      videoId = parts[parts.length - 1];
    }
    if(videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      iframe.style.height = '150px';
      iframe.src = embedUrl;
      return iframe;
    }
  }
  return null;
}

// Posisi note menyesuaikan posisi klik
function positionNote(note, x, y) {
  const boardRect = board.getBoundingClientRect();
  const noteWidth = note.offsetWidth || 200;
  const noteHeight = note.offsetHeight || 200;

  let left = x;
  let top = y;

  if(left + noteWidth > board.clientWidth) {
    left = board.clientWidth - noteWidth - 10;
  }
  if(top + noteHeight > board.clientHeight) {
    top = board.clientHeight - noteHeight - 10;
  }
  if(left < 10) left = 10;
  if(top < 10) top = 10;

  note.style.left = left + 'px';
  note.style.top = top + 'px';
}

// Toggle menu pin (edit, hapus)
function togglePinMenu(note, pin) {
  const existingMenu = note.querySelector('.pin-menu');
  if(existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.classList.add('pin-menu');

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Ubah';
  editBtn.onclick = e => {
    e.stopPropagation();
    openFormEdit(note);
    menu.remove();
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Hapus';
  deleteBtn.onclick = e => {
    e.stopPropagation();
    if(confirm('Hapus note ini?')) {
      note.remove();
      menu.remove();
    }
  };

  menu.appendChild(editBtn);
  menu.appendChild(deleteBtn);

  pin.appendChild(menu);
}

// Buka form untuk edit isi note
function openFormEdit(note) {
  currentEditNote = note;
  noteContents = JSON.parse(note.dataset.contents || '[]');
  updateContentsPreview();
  resetFormInputs();

  noteForm.style.display = 'block';
  // Isi form dengan data terakhir (konten tidak diisi karena multi pesan, cukup preview)
  textInputContainer.style.display = 'none';
  musicInputContainer.style.display = 'none';
  imageInputContainer.style.display = 'none';
  voiceInputContainer.style.display = 'none';
  linkInputContainer.style.display = 'none';

  overlay.style.display = 'none';
}

// Buka form tambah note
board.ondblclick = e => {
  if(e.target !== board) return;
  const rect = board.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  tempPos = { x, y };

  resetFormInputs();
  noteContents = [];
  updateContentsPreview();

  noteForm.style.display = 'block';
  overlay.style.display = 'none';
};

// Zoom note membesar dengan overlay
function zoomNote(note) {
  if(isNoteZoomed) return;
  isNoteZoomed = true;
  zoomedNote = note;

  const rect = note.getBoundingClientRect();

  // Salin isi note ke popup
  popup.innerHTML = '';
  const contents = JSON.parse(note.dataset.contents || '[]');

  // Foto di atas
  const images = contents.filter(c => c.type === 'image');
  images.forEach(item => {
    const img = document.createElement('img');
    img.src = item.content;
    popup.appendChild(img);
  });

  // Isi lain (text, music, voice, link)
  const others = contents.filter(c => c.type !== 'image');
  others.forEach(item => {
    if(item.type === 'text') {
      const p = document.createElement('p');
      p.innerHTML = linkify(item.content);
      popup.appendChild(p);
    } else if(item.type === 'music') {
      const iframe = createMusicEmbed(item.content);
      if(iframe) popup.appendChild(iframe);
      else {
        const a = document.createElement('a');
        a.href = item.content;
        a.target = '_blank';
        a.textContent = item.content;
        popup.appendChild(a);
      }
    } else if(item.type === 'voice') {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = item.content;
      popup.appendChild(audio);
    } else if(item.type === 'link') {
      const a = document.createElement('a');
      a.href = item.content;
      a.target = '_blank';
      a.textContent = item.content;
      popup.appendChild(a);
    }
  });

  overlay.style.display = 'flex';

  // Tutup zoom dengan klik overlay
  overlay.onclick = e => {
    if(e.target === overlay) {
      closeZoom();
    }
  };
}

// Tutup zoom popup
function closeZoom() {
  isNoteZoomed = false;
  zoomedNote = null;
  overlay.style.display = 'none';
  popup.innerHTML = '';
}

// Tutup menu pin saat klik di luar
document.addEventListener('click', e => {
  document.querySelectorAll('.pin-menu').forEach(menu => menu.remove());
});
