/* =========================
   MENGAMBIL ELEMEN HTML
========================= */

/* Tombol menu */
const menu = document.querySelector('.menu');

/* Tulisan di dalam menu */
const teksMenu = menu.querySelector('p');

/* List sosial media */
const daftarSosial = document.querySelector('.social-lists');


/* =========================
   SAAT MENU DIKLIK
========================= */

menu.onclick = e => {

    /* Agar klik tidak keluar */
    e.stopPropagation();

    /* Menampilkan list */
    daftarSosial.classList.toggle('show');

    /* Memutar icon panah */
    menu.classList.toggle('rotate');
};


/* =========================
   SAAT ITEM SOSIAL DIKLIK
========================= */

daftarSosial.onclick = e => {

    e.stopPropagation();

    /* Mengambil item LI terdekat */
    const li = e.target.closest('li');

    /* Jika tidak ada item */
    if(!li) return;

    /* Mengambil link URL */
    const url = li.dataset.url;

    /* Mengambil icon */
    const icon = li.querySelector('i');

    /* Mengubah isi menu sesuai pilihan */
    teksMenu.innerHTML = `
        <i class="${icon.className}"
           style="
           color:${icon.style.color};
           font-size:1.5rem;
           margin-right:8px;">
        </i>

        <span>
            ${li.querySelector('span').textContent}
        </span>
    `;

    /* Menutup list */
    daftarSosial.classList.remove('show');

    /* Mengembalikan icon panah */
    menu.classList.remove('rotate');

    /* Membuka link */
    setTimeout(() => {
        window.open(url, '_blank');
    }, 200);
};


/* =========================
   MENUTUP MENU SAAT KLIK LUAR
========================= */

document.onclick = () => {

    daftarSosial.classList.remove('show');

    menu.classList.remove('rotate');
};


/* =========================
   MENUTUP MENU DENGAN ESC
========================= */

document.onkeydown = e => {

    if(e.key === 'Escape'){

        daftarSosial.classList.remove('show');

        menu.classList.remove('rotate');
    }
};