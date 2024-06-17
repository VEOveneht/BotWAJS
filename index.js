const {
    Client,
    LocalAuth
} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const os = require("os");
const fs = require("fs");
const path = require("path");
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "database",
    }),
});

function saveUser(
    nomor,
    nama = "-",
    umur = 0,
    gender = "-",
    koinIncrement = 0,
    limit = 0
) {
    try {
        const users = loadUsers();
        const existingUserIndex = users.findIndex((user) => user.nomor === nomor);
        if (existingUserIndex !== -1) {
            // Jika pengguna sudah ada, update informasinya
            const existingUser = users[existingUserIndex];
            existingUser.nama = nama !== "-" ? nama : existingUser.nama;
            existingUser.umur = umur !== 0 ? umur : existingUser.umur;
            existingUser.gender = gender !== "-" ? gender : existingUser.gender;
        } else {
            // Jika pengguna belum ada, tambahkan sebagai pengguna baru
            const newUser = {
                nomor: nomor,
                nama: nama,
                umur: umur,
                gender: gender,
                koin: koinIncrement,
                limit: limit, // Menyimpan jumlah koin baru
            };
            users.push(newUser);
        }

        fs.writeFileSync(
            path.join(__dirname, "database", "users", "user.json"),
            JSON.stringify(users, null, 2)
        );
        console.log(`Pengguna ${nomor} berhasil disimpan.`);
    } catch (error) {
        console.error("Gagal menyimpan pengguna:", error.message);
    }
}

function increaseUserCoins(nomor, koinIncrement = 0) {
    try {
        const users = loadUsers();
        const existingUserIndex = users.findIndex((user) => user.nomor === nomor);
        if (existingUserIndex !== -1) {
            // Jika pengguna sudah ada, update informasinya
            const existingUser = users[existingUserIndex];
            existingUser.koin += koinIncrement; // Menambahkan koin baru ke jumlah koin yang sudah ada
        } else {
            // Jika pengguna belum ada, tambahkan sebagai pengguna baru
            const newUser = {
                nomor: nomor,
                koin: koinIncrement, // Menyimpan jumlah koin baru
            };
            users.push(newUser);
        }

        fs.writeFileSync(
            path.join(__dirname, "database", "users", "user.json"),
            JSON.stringify(users, null, 2)
        );
        console.log(`Koin ${nomor} berhasil disimpan.`);
    } catch (error) {
        console.error("Gagal menyimpan Koin:", error.message);
    }
}

async function buyLimit(nomor, quantity) {
    try {
        const users = loadUsers();
        const existingUserIndex = users.findIndex((user) => user.nomor === nomor);

        if (existingUserIndex !== -1) {
            const existingUser = users[existingUserIndex];
            const limitPricePerUnit = 1250; // Harga setiap limit dalam koin

            // Hitung total harga limit yang akan dibeli
            const totalPrice = limitPricePerUnit * quantity;

            if (existingUser.koin >= totalPrice) {
                // Kurangi jumlah koin pengguna sesuai dengan harga total pembelian
                existingUser.koin -= totalPrice;

                // Tambahkan jumlah limit yang dibeli ke dalam data pengguna
                existingUser.limit += quantity;

                fs.writeFileSync(
                    path.join(__dirname, "database", "users", "user.json"),
                    JSON.stringify(users, null, 2)
                );

                console.log(`Pengguna ${nomor} berhasil membeli ${quantity} limit.`);
                return true; // Berhasil membeli limit
            } else {
                console.log(`Pengguna ${nomor} tidak memiliki cukup koin.`);
                return false; // Tidak cukup koin untuk membeli limit
            }
        }
    } catch (error) {
        console.error("Gagal membeli limit:", error.message);
        return false;
    }
}

function loadUsers() {
    try {
        const usersData = fs.readFileSync(
            path.join(__dirname, "database", "users", "user.json")
        );
        return JSON.parse(usersData);
    } catch (error) {
        console.error("Gagal memuat pengguna:", error.message);
        return [];
    }
}

function isRegistered(nomor) {
    try {
        const users = loadUsers();
        return users.some((user) => user.nomor === nomor);
    } catch (error) {
        console.error("Gagal memeriksa pengguna terdaftar:", error.message);
        return false;
    }
}

module.exports = {
    saveUser,
    loadUsers,
    isRegistered,
};

client.on("qr", (qr) => {
    qr = qrcode.generate(qr, {
        small: true
    });
});

client.once("ready", () => {
    console.log(
        "██    ██ ███████  ██████  ███    ███ ██████  \n██    ██ ██      ██    ██ ████  ████ ██   ██ \n██    ██ █████   ██    ██ ██ ████ ██ ██   ██ \n ██  ██  ██      ██    ██ ██  ██  ██ ██   ██ \n  ████   ███████  ██████  ██      ██ ██████  \n"
    );
});

client.on("message_create", async(msg) => {
    const konten = msg.body.split(" ");
    const pesan = msg.body.toLowerCase();
    const kontak = await msg.getContact();

    const nomor = kontak.number;
    const nama = kontak.name;
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const formattedFreeMem = (freeMem / (1024 * 1024 * 1024)).toFixed(2);
    const formattedTotalMem = (totalMem / (1024 * 1024 * 1024)).toFixed(2);
    const formattedUsedMem = (usedMem / (1024 * 1024 * 1024)).toFixed(2);
    const uptime = os.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const users = loadUsers();
    const user = users.find((user) => user.nomor === nomor);

    try {
        console.log(`│${msg.type}│ ${nama}: ${konten}`);
        if (msg.body == ".ping") {
            await msg.reply(
                `🔴 *Nyala Bro!*\n💿 Memori: ${formattedUsedMem}GB/${formattedTotalMem}GB\n💻 Uptime: ${hours} Jam ${minutes} Menit`
            );
        }
        if (msg.body == ".menu") {
            await msg.reply(
                `*Halo! Bot Veo Disini!*\nlib: whatsapp-web.js\nurl: veoveneht.github.io\n╔ *MENU* ════════════════╗\n│.ping\n│.menu\n│\n│ *CREATE*\n│.sticker <nama> <author>\n│.s <nama> <author>\n│\n│ *ECONOMY*\n│.shop\n│.buy <items> <quantity>\n│.bal\n│.work\n╚═════════════════ *END* ╝`
            );
        }
        if (konten[0] == ".reg") {
            const nama = konten[1];
            const umurInput = konten[2];
            const gender = konten[3];
            const umur = parseInt(umurInput);

            if (isRegistered(nomor)) {
                await msg.reply("Kamu sudah terdaftar");
            } else if (!nama) {
                await msg.reply(
                    `Masukkan nama kamu\nContoh \`.reg <nama> <umur> <gender>\``
                );
            } else {
                saveUser(nomor, nama, umur, gender); // Menyimpan pengguna baru ke dalam database
                await msg.reply(
                    `Halo ${nama}^^, Pendaftaran kamu telah diterima.\nSelamat bersenang-senang!^^`
                );
            }
        }
        if (konten[0] == ".rereg") {
            const nama = konten[1];
            const umurInput = konten[2];
            const gender = konten[3];
            const umur = parseInt(umurInput);

            if (!nama) {
                await msg.reply(
                    `Masukkan nama kamu\n Contoh \`.rereg <nama> <umur> <gender>\``
                );
            } else if (!isRegistered(nomor)) {
                await msg.reply(
                    `Kamu harus daftar terlebih dahulu untuk Registrasi Ulang\nKetik \`.reg <nama> <umur> <gender>\`\nNama doang boleh kok, asal ada namanya aja ya^^`
                );
            } else {
                saveUser(nomor, nama, umur, gender); // Menyimpan pengguna baru ke dalam database
                await msg.reply(
                    `Hey ${nama}! Pendaftaran ulang kamu berhasil!\nCieee Profile Baru XD`
                );
            }
        }
        if (konten[0] == ".sticker" || konten[0] == ".s") {
            const stickerName = konten[1];
            const stickerAuthor = konten[2];
            try {
                if (!isRegistered(nomor)) {
                    await msg.reply(
                        `Kamu harus daftar terlebih dahulu untuk memakai fitur ini\nKetik \`.reg <nama> <umur> <gender>\`\nNama doang boleh kok, asal ada namanya aja ya^^`
                    );
                } else if (msg.hasMedia) {
                    const media = await msg.downloadMedia();
                    await client.sendMessage(msg.from, media, {
                        sendMediaAsSticker: true,
                        stickerName: stickerName || "© 2024 VeoMD",
                        stickerAuthor: stickerAuthor || "VeoBOT Free Sticker: 6283113810321",
                    });
                }
            } catch (error) {
                console.log(error);
                console.log(error.msg);
            }
        }
        if (msg.body == ".profile") {
            if (!isRegistered(nomor)) {
                await msg.reply(
                    `Kamu harus daftar terlebih dahulu untuk melihat Profile\nKetik \`.reg <nama> <umur> <gender>\``
                );
            } else {
                await msg.reply(
                    `*Profile*\nNama: ${user.nama}\nUmur: ${user.umur}\nGender: ${user.gender}\n\nDompet kamu di \`.bal\``
                );
            }
        }
        if (msg.body == ".balance" || msg.body == ".bal") {
            if (!isRegistered(nomor)) {
                await msg.reply(
                    `Kamu harus daftar terlebih dahulu untuk melihat Dompet\nKetik \`.reg <nama> <umur> <gender>\``
                );
            } else {
                await msg.reply(`*Balance*\nKoin: ${user.koin}\nLimit: ${user.limit}`);
            }
        }
        if (konten[0] == ".work") {
            if (!isRegistered(nomor)) {
                await msg.reply(
                    `Kamu harus daftar terlebih dahulu untuk Bekerja\nKetik \`.reg <nama> <umur> <gender>\``
                );
            } else if (isRegistered(nomor)) {
                const koin = Math.floor(Math.random() * (250 - 100 + 1)) + 100; // Mendapatkan koin acak antara 100 hingga 250
                await msg.reply(`🛠️ ni ${user.nama} kerja dapet gaji ${koin} koin.`);
                increaseUserCoins(nomor, koin); // Perbarui profil pengguna dengan jumlah koin yang didapatkan
            }
        }
        if (msg.body == ".shop") {
            await msg.reply(`1. 1 limit = 1250 koin`);
        }
        if (konten[0] === ".buy" && konten[1] === "limit") {
            const quantity = parseInt(konten[2]);

            if (!isRegistered(nomor)) {
                await msg.reply(
                    `Kamu harus daftar terlebih dahulu untuk membeli\nKetik \`.reg <nama> <umur> <gender>\``
                );
            } else if (!isNaN(quantity) && quantity > 0) {
                const pembelianBerhasil = await buyLimit(nomor, quantity);

                if (pembelianBerhasil) {
                    await msg.reply(`Pembelian ${quantity} limit berhasil!`);
                } else {
                    await msg.reply(
                        "Maaf, pembelian limit gagal. Anda tidak memiliki cukup koin."
                    );
                }
            } else {
                await msg.reply(
                    "Format jumlah limit tidak valid. Gunakan format: `.buy limit [jumlah]`"
                );
            }
        }
    } catch (error) {
        console.log(error);
        console.log(error.msg);
    }
});

client.initialize();