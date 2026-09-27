// Menunggu halaman selesai dimuat
document.addEventListener("DOMContentLoaded", function(){

    // Mengambil form login
    const formLogin =
    document.getElementById("formLogin");

    // Event saat tombol login ditekan
    formLogin.addEventListener(
        "submit",
        function(event){

            // Mencegah refresh halaman
            event.preventDefault();

            // Mengambil isi email
            const email =
            document.getElementById("email").value;

            // Mengambil isi password
            const password =
            document.getElementById("password").value;

            // Memanggil fungsi validasi
            if(validasiForm(email,password))
            {
                alert(
                    "Login berhasil!"
                );

                console.log(
                    "Email : " + email
                );

                console.log(
                    "Password : " + password
                );
            }
        }
    );

});

/* ==========================
   FUNGSI VALIDASI FORM
========================== */

function validasiForm(
    email,
    password
){

    // Jika email kosong
    if(email === "")
    {
        alert(
            "Email harus diisi"
        );

        return false;
    }

    // Jika password kosong
    if(password === "")
    {
        alert(
            "Password harus diisi"
        );

        return false;
    }

    // Pola email sederhana
    const polaEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Jika format email salah
    if(!polaEmail.test(email))
    {
        alert(
            "Format email tidak valid"
        );

        return false;
    }

    // Jika semua benar
    return true;
}